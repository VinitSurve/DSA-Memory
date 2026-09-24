export type Platform = "hackerrank";

export interface ProblemMetadata {
  id?: string;
  platform: Platform;
  externalProblemId?: string;
  title: string;
  url: string;
  difficulty?: string;
  topics?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionData {
  id?: string;
  problemId?: string;
  language?: string;
  solutionCode: string;
  submissionFingerprint?: string;
  submittedAt: string;
  createdAt?: string;
}

export interface MemoryData {
  id?: string;
  problemId: string;
  nextReviewAt?: string;
  lastReviewedAt?: string;
  reviewCount: number;
  userNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extracted payload from content script remains flattened
export interface ExtractedSubmissionPayload extends Omit<ProblemMetadata, 'id' | 'createdAt' | 'updatedAt' | 'topics'>, Omit<SubmissionData, 'id' | 'problemId' | 'createdAt' | 'submissionFingerprint'> {
}

export type ExtensionMessage =
  | { type: "SUBMISSION_DETECTED"; payload: ExtractedSubmissionPayload }
  | { type: "GET_STATUS" }
  | { type: "GET_RECENT_SUBMISSIONS" };
