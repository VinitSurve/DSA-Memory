export type Platform = "hackerrank" | string;

export interface Problem {
  id: string;
  platform: Platform;
  external_problem_id: string | null;
  title: string;
  url: string;
  difficulty: string | null;
  topics: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  problem_id: string;
  language: string | null;
  solution_code: string;
  submission_fingerprint: string;
  submitted_at: string;
  created_at: string;
}

export interface Memory {
  id: string;
  problem_id: string;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  review_count: number;
  user_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProblems: number;
  totalSubmissions: number;
  problemsDueForReview: number;
  problemsRecentlySolved: number;
}
