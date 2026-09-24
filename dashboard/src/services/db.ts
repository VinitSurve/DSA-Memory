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
      memory: (row.memories && row.memories.length > 0) ? row.memories[0] : null
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
    submissions: data.submissions?.sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()) || [],
    memory: (data.memories && data.memories.length > 0) ? data.memories[0] : null
  };
}
