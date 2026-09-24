-- Add submission_fingerprint for atomic uniqueness

alter table problems 
add column submission_fingerprint text;

-- Create unique index to guarantee database-level deduplication
create unique index idx_problems_fingerprint on problems(submission_fingerprint);
