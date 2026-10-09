-- Black Ledger Junior v1: guardian-owned learner aliases and append-only answer events.
-- Apply AFTER supabase/schema.sql. Do not grant independent minor accounts here.
-- A guardian authenticates through Supabase and owns all data under their account.

create table if not exists public.junior_learners (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 24),
  created_at timestamptz not null default now(),
  unique (id, guardian_id)
);

create index if not exists idx_junior_learners_guardian
  on public.junior_learners (guardian_id, created_at);

create table if not exists public.junior_answer_events (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  learner_id uuid not null,
  attempt_id uuid not null,
  lesson_id text not null,
  question_id text not null,
  difficulty smallint not null check (difficulty between 1 and 3),
  selected_choice smallint not null check (selected_choice between 0 and 2),
  is_correct boolean not null,
  answer_number smallint not null check (answer_number between 1 and 20),
  elapsed_ms integer not null check (elapsed_ms between 0 and 86400000),
  created_at timestamptz not null default now(),
  unique (attempt_id, answer_number),
  foreign key (learner_id, guardian_id)
    references public.junior_learners (id, guardian_id) on delete cascade
);

create index if not exists idx_junior_answer_events_learner_created
  on public.junior_answer_events (learner_id, created_at);
create index if not exists idx_junior_answer_events_guardian
  on public.junior_answer_events (guardian_id);

alter table public.junior_learners enable row level security;
alter table public.junior_answer_events enable row level security;

-- One guardian can read/manage only profiles and events they own.
drop policy if exists "junior_guardian_profiles" on public.junior_learners;
create policy "junior_guardian_profiles" on public.junior_learners
  for all to authenticated
  using ((select auth.uid()) = guardian_id)
  with check ((select auth.uid()) = guardian_id);

drop policy if exists "junior_guardian_read_events" on public.junior_answer_events;
create policy "junior_guardian_read_events" on public.junior_answer_events
  for select to authenticated
  using ((select auth.uid()) = guardian_id);

-- Events are append-only from the browser. They cannot be modified or deleted there.
drop policy if exists "junior_guardian_insert_events" on public.junior_answer_events;
create policy "junior_guardian_insert_events" on public.junior_answer_events
  for insert to authenticated
  with check ((select auth.uid()) = guardian_id);

-- The client records answer correctness and timing; this is a learning signal,
-- not a proctored/certified assessment. Production validation must happen server-side.
