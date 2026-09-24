-- DSA Memory Migration - Initial Setup

create table problems (
    id uuid primary key default gen_random_uuid(),
    platform text not null,
    external_problem_id text,
    external_submission_id text,
    title text not null,
    url text not null,
    difficulty text,
    language text,
    solution_code text not null,
    submitted_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for efficient querying and deduplication
create index idx_problems_platform_ext_sub_id on problems(platform, external_submission_id);
create index idx_problems_platform_url on problems(platform, url);

-- Row Level Security (RLS)
-- NOTE: For this MVP, we are intentionally deferring user authentication.
-- The RLS policies below allow anonymous inserts and selects.
-- In a production environment with multiple users, you MUST add a `user_id` column,
-- require authentication, and modify these policies to check `auth.uid() = user_id`.

alter table problems enable row level security;

-- Allow anyone with the anon key to insert (MVP ONLY)
create policy "Allow anonymous inserts for MVP"
on problems for insert
with check (true);

-- Allow anyone with the anon key to read their problems (MVP ONLY)
create policy "Allow anonymous selects for MVP"
on problems for select
using (true);
