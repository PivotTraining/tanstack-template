create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  inventory jsonb default '{}'::jsonb,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists learner_progress (
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'started',
  score numeric,
  evidence jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key(user_id, lesson_id)
);

create table if not exists assessment_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  assessment_id text not null,
  score numeric not null,
  passed boolean not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists journal_entries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  entry jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table learner_progress enable row level security;
alter table assessment_attempts enable row level security;
alter table journal_entries enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own progress" on learner_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts" on assessment_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own journal" on journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
