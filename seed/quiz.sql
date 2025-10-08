-- Quiz Feature Database Schema
-- Run this in your Supabase SQL Editor

-- Create pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- Create enum for question types
do $$ begin
  if not exists (select 1 from pg_type where typname = 'question_type') then
    create type question_type as enum (
      'single_choice','multi_choice','short_text','long_text',
      'number','money','address','yes_no','phone','email','date'
    );
  end if;
end $$;

-- Sections table
create table if not exists quiz_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  is_optional boolean not null default false,
  visible_if jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Questions table
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references quiz_sections(id) on delete cascade,
  key text unique not null,
  prompt text not null,
  type question_type not null,
  required boolean not null default false,
  sort_order int not null default 0,
  help_text text,
  ui_props jsonb,
  visible_if jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Options table (for multiple choice questions)
create table if not exists quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int not null default 0,
  tags jsonb,
  weight int,
  created_at timestamptz not null default now()
);

-- Sessions table (tracks user progress)
create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'in_progress',
  purpose text,
  selected_categories text[],
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists quiz_sessions_user_idx on quiz_sessions(user_id);

-- Responses table (stores answers)
create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null references quiz_sessions(id) on delete cascade,
  question_id uuid not null references quiz_questions(id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists quiz_responses_unique on quiz_responses(session_id, question_id);
create index if not exists quiz_responses_user_idx on quiz_responses(user_id);

-- Enable Row Level Security
alter table quiz_sections enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_sessions enable row level security;
alter table quiz_responses enable row level security;

-- RLS Policies for quiz structure (public read)
create policy "public read sections" on quiz_sections for select using (true);
create policy "public read questions" on quiz_questions for select using (true);
create policy "public read options" on quiz_options for select using (true);

-- RLS Policies for sessions (users can only access their own)
create policy "own sessions select" on quiz_sessions for select using (auth.uid() = user_id);
create policy "own sessions insert" on quiz_sessions for insert with check (auth.uid() = user_id);
create policy "own sessions update" on quiz_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS Policies for responses (users can only access their own)
create policy "own responses select" on quiz_responses for select using (auth.uid() = user_id);
create policy "own responses upsert" on quiz_responses for insert with check (auth.uid() = user_id);
create policy "own responses update" on quiz_responses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Function to start a new quiz session
create or replace function start_quiz_session(purpose_in text, cats_in text[])
returns quiz_sessions
language plpgsql
security definer
as $$
declare s quiz_sessions;
begin
  insert into quiz_sessions (user_id, purpose, selected_categories)
  values (auth.uid(), purpose_in, cats_in)
  returning * into s;
  return s;
end $$;

revoke all on function start_quiz_session(text, text[]) from public;
grant execute on function start_quiz_session(text, text[]) to authenticated;

-- Function to upsert a quiz response
create or replace function upsert_quiz_response(session_in uuid, question_in uuid, value_in jsonb)
returns quiz_responses
language plpgsql
security definer
as $$
declare r quiz_responses;
declare sess_user uuid;
begin
  select user_id into sess_user from quiz_sessions where id = session_in;
  if sess_user is null or sess_user <> auth.uid() then
    raise exception 'Not allowed';
  end if;

  insert into quiz_responses (user_id, session_id, question_id, value)
  values (sess_user, session_in, question_in, value_in)
  on conflict (session_id, question_id)
  do update set value = excluded.value, updated_at = now()
  returning * into r;

  return r;
end $$;

revoke all on function upsert_quiz_response(uuid, uuid, jsonb) from public;
grant execute on function upsert_quiz_response(uuid, uuid, jsonb) to authenticated;

