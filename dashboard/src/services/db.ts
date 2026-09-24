import { supabase } from './supabase';
import { Problem, Submission, Memory, DashboardStats } from '../types/database';

export type ProblemWithMeta = Problem & {
  submissions: { count: number; latest: string | null };
  memory: Memory | null;
};

export type ProblemDetail = Problem & {
  submissions: Submission[];
  memory: Memory | null;
};

// Data boundary helper: some legacy submissions have literal '\\n' stored instead of actual newlines.
function normalizeSubmission(sub: Submission): Submission {
  if (sub && sub.solution_code && sub.solution_code.includes('\\n')) {
    return { ...sub, solution_code: sub.solution_code.replace(/\\n/g, '\n') };
  }
  return sub;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [problemsRes, submissionsRes, dueRes] = await Promise.all([
    supabase.from('problems').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('memories').select('id', { count: 'exact', head: true }).lte('next_review_at', new Date().toISOString())
  ]);

  // For recently solved, we could query recent submissions, but for stats we'll just count problems solved in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentCount } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    totalProblems: problemsRes.count || 0,
    totalSubmissions: submissionsRes.count || 0,
    problemsDueForReview: dueRes.count || 0,
    problemsRecentlySolved: recentCount || 0,
  };
}

export async function getProblems(): Promise<ProblemWithMeta[]> {
  const { data, error } = await supabase
    .from('problems')
    .select(`
      *,
      submissions ( id, submitted_at ),
      memories ( * )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching problems:', error);
    return [];
  }

  // Map the joined data to ProblemWithMeta
  return data.map((row: any) => {
    const subs = row.submissions || [];
    const latestSub = subs.length > 0 
      ? subs.reduce((latest: string, sub: any) => sub.submitted_at > latest ? sub.submitted_at : latest, subs[0].submitted_at)
      : null;

    return {
      ...row,
      submissions: {
        count: subs.length,
        latest: latestSub
      },
      memory: Array.isArray(row.memories) ? (row.memories.length > 0 ? row.memories[0] : null) : (row.memories || null)
    };
  });
}

export async function getProblemById(id: string): Promise<ProblemDetail | null> {
  const { data, error } = await supabase
    .from('problems')
    .select(`
      *,
      submissions ( * ),
      memories ( * )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching problem details:', error);
    return null;
  }

  return {
    ...data,
    submissions: (data.submissions?.map(normalizeSubmission) || []).sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
    memory: Array.isArray(data.memories) ? (data.memories.length > 0 ? data.memories[0] : null) : (data.memories || null)
  };
}

export async function getReviewQueue() {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('problems')
    .select(`
      *,
      submissions ( id, submitted_at ),
      memories!inner ( * )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching review queue:', error);
    return { due: [], unreviewed: [], upcoming: [] };
  }

  const due: ProblemWithMeta[] = [];
  const unreviewed: ProblemWithMeta[] = [];
  const upcoming: ProblemWithMeta[] = [];

  for (const row of data) {
    const memory = Array.isArray(row.memories) ? (row.memories.length > 0 ? row.memories[0] : null) : (row.memories || null);
    if (!memory) continue;

    const subs = row.submissions || [];
    const latestSub = subs.length > 0 
      ? subs.reduce((latest: string, sub: any) => sub.submitted_at > latest ? sub.submitted_at : latest, subs[0].submitted_at)
      : null;

    const mappedProblem: ProblemWithMeta = {
      ...row,
      submissions: { count: subs.length, latest: latestSub },
      memory
    };

    if (memory.next_review_at === null && memory.review_count === 0) {
      unreviewed.push(mappedProblem);
    } else if (memory.next_review_at && memory.next_review_at <= now) {
      due.push(mappedProblem);
    } else if (memory.next_review_at && memory.next_review_at > now) {
      upcoming.push(mappedProblem);
    }
  }

  // Sort upcoming by soonest first
  upcoming.sort((a, b) => {
    if (!a.memory?.next_review_at || !b.memory?.next_review_at) return 0;
    return new Date(a.memory.next_review_at).getTime() - new Date(b.memory.next_review_at).getTime();
  });

  return { due, unreviewed, upcoming };
}

import { calculateNextReview, ReviewRating } from './review-engine';

export async function completeReview(problemId: string, rating: ReviewRating): Promise<{ success: boolean, nextReviewAt?: string }> {
  // 1. Fetch current memory
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('problem_id', problemId);
    
  const currentMemory = memories && memories.length > 0 ? memories[0] : null;

  // 2. Calculate next state
  const nextState = calculateNextReview(currentMemory, rating);

  // 3. Update memory
  const { error } = await supabase
    .from('memories')
    .update({
      review_count: nextState.review_count,
      last_reviewed_at: nextState.last_reviewed_at,
      next_review_at: nextState.next_review_at,
      updated_at: new Date().toISOString()
    })
    .eq('problem_id', problemId);

  if (error) {
    console.error('Failed to complete review:', error);
    return { success: false };
  }
  
  return { success: true, nextReviewAt: nextState.next_review_at || undefined };
}
