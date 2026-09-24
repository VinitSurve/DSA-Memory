-- Enable pgcrypto for generating SHA-256 fingerprints for old rows
create extension if not exists "pgcrypto";

-- 1. Rename existing table and drop its specific constraints to make way for the new schema
alter table problems rename to legacy_problems;
alter table legacy_problems drop constraint if exists problems_pkey;
drop index if exists idx_problems_platform_ext_sub_id;
drop index if exists idx_problems_platform_url;
drop index if exists idx_problems_fingerprint;

-- 2. Create the new normalized schema
create table problems (
    id uuid primary key default gen_random_uuid(),
    platform text not null,
    external_problem_id text,
    title text not null,
    url text not null,
    difficulty text,
    topics text[] default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_platform_url unique(platform, url)
);

create table submissions (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references problems(id) on delete cascade not null,
    language text,
    solution_code text not null,
    submission_fingerprint text not null unique,
    submitted_at timestamptz not null,
    created_at timestamptz not null default now()
);

create table memories (
    id uuid primary key default gen_random_uuid(),
    problem_id uuid references problems(id) on delete cascade not null unique,
    next_review_at timestamptz,
    last_reviewed_at timestamptz,
    review_count int not null default 0,
    user_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS Policies (MVP Anonymous Access)
alter table problems enable row level security;
create policy "Allow anonymous inserts for MVP" on problems for insert with check (true);
create policy "Allow anonymous selects for MVP" on problems for select using (true);

alter table submissions enable row level security;
create policy "Allow anonymous inserts for MVP" on submissions for insert with check (true);
create policy "Allow anonymous selects for MVP" on submissions for select using (true);

alter table memories enable row level security;
create policy "Allow anonymous inserts for MVP" on memories for insert with check (true);
create policy "Allow anonymous selects for MVP" on memories for select using (true);
create policy "Allow anonymous updates for MVP" on memories for update using (true);

-- 3. Data Migration
-- A. Backfill Problems
insert into problems (platform, external_problem_id, title, url, difficulty, created_at, updated_at)
select distinct on (platform, url)
    platform,
    external_problem_id,
    title,
    url,
    difficulty,
    created_at,
    updated_at
from legacy_problems
order by platform, url, submitted_at desc;

-- B. Backfill Submissions
-- We join on platform and url to link back to the new problem_id
insert into submissions (id, problem_id, language, solution_code, submission_fingerprint, submitted_at, created_at)
select
    l.id,
    p.id,
    l.language,
    l.solution_code,
    coalesce(
        l.submission_fingerprint,
        encode(digest(l.platform || ':' || l.url || ':' || l.solution_code, 'sha256'), 'hex')
    ),
    l.submitted_at,
    l.created_at
from legacy_problems l
join problems p on p.platform = l.platform and p.url = l.url
on conflict (submission_fingerprint) do nothing; -- Deduplicate exact same code submissions from legacy

-- C. Backfill Memories (Initialize a memory state for each problem)
insert into memories (problem_id)
select id from problems;

-- Note: legacy_problems is NOT dropped here per migration safety requirements.
