# Client Quiz Feature - Setup Guide

This guide will walk you through setting up the Client Quiz feature for Align.

## Overview

The Client Quiz is a multi-section questionnaire that captures client preferences, needs, and details to match them with the perfect realtor. The quiz features:

- ✅ **Smart conditional logic** - Questions appear based on previous answers
- ✅ **Auto-save functionality** - Responses are saved automatically as users type
- ✅ **Resume capability** - Users can leave and come back anytime
- ✅ **Mobile-first design** - Optimized for all devices
- ✅ **Progress tracking** - Visual progress bar and section completion status
- ✅ **Flexible content** - All questions are stored in the database and can be updated without code changes

## 🚀 Setup Instructions

### Step 1: Run the Database Migration

Open your Supabase SQL Editor and run the complete SQL migration:

```sql
create extension if not exists "pgcrypto";

do $$ begin
  if not exists (select 1 from pg_type where typname = 'question_type') then
    create type question_type as enum (
      'single_choice','multi_choice','short_text','long_text',
      'number','money','address','yes_no','phone','email','date'
    );
  end if;
end $$;

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

alter table quiz_sections enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_sessions enable row level security;
alter table quiz_responses enable row level security;

create policy "public read sections" on quiz_sections for select using (true);
create policy "public read questions" on quiz_questions for select using (true);
create policy "public read options" on quiz_options for select using (true);

create policy "own sessions select" on quiz_sessions for select using (auth.uid() = user_id);
create policy "own sessions insert" on quiz_sessions for insert with check (auth.uid() = user_id);
create policy "own sessions update" on quiz_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own responses select" on quiz_responses for select using (auth.uid() = user_id);
create policy "own responses upsert" on quiz_responses for insert with check (auth.uid() = user_id);
create policy "own responses update" on quiz_responses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
```

### Step 2: Verify Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these in your Supabase project settings:
- Go to **Project Settings** > **API**
- Copy the Project URL
- Copy the `anon` `public` key
- Copy the `service_role` `secret` key (⚠️ Keep this secret!)

### Step 3: Seed the Quiz Questions

The quiz definition is already created in `seed/quiz.definition.json`. Now run the seed script:

```bash
npm run tsx scripts/seed-quiz.ts
```

Or if you don't have tsx configured:

```bash
npx tsx scripts/seed-quiz.ts
```

You should see output like:

```
🌱 Starting quiz seeding...

✅ Loaded seed file (version: v1)

📁 Processing section: Let's get you matched (entry)
   ✅ Section upserted (ID: xxx)
   📝 Processing question: What are you looking to do today?
      ✅ Question upserted (ID: xxx)
      ✅ Inserted 4 options
...

🎉 Seeding complete!
   📁 Sections: 9
   📝 Questions: 45+
   ⚡ Options: 100+
```

### Step 4: Start Your Development Server

```bash
npm run dev
```

### Step 5: Test the Quiz

1. Navigate to `http://localhost:3000/quiz`
2. You should see the quiz landing page
3. Click "Start Quiz" to begin
4. Answer questions and watch them auto-save
5. Try refreshing the page - your progress should be saved
6. Complete the quiz and see the completion page

## 📁 File Structure

```
align-beta/
├── app/
│   ├── quiz/
│   │   ├── page.tsx                    # Quiz landing page
│   │   ├── [sectionKey]/
│   │   │   └── page.tsx                # Dynamic section page
│   │   ├── complete/
│   │   │   └── page.tsx                # Completion page
│   │   ├── _actions.ts                 # Server actions
│   │   └── _components/
│   │       ├── Question.tsx            # Question renderer
│   │       ├── Progress.tsx            # Progress indicator
│   │       ├── SectionForm.tsx         # Section form handler
│   │       ├── SectionLayout.tsx       # Layout wrapper
│   │       └── StartQuizForm.tsx       # Start form
│   └── api/
│       └── quiz/
│           └── structure/
│               └── route.ts            # API endpoint (optional)
├── lib/
│   └── quiz/
│       ├── types.ts                    # TypeScript types
│       └── visibility.ts               # Visibility logic
├── scripts/
│   └── seed-quiz.ts                    # Seeding script
└── seed/
    └── quiz.definition.json            # Quiz content
```

## 🎨 Features & Improvements Made

### From the Original Spec:

1. **Enhanced UI Components**
   - Reused existing Button and Input components for consistency
   - Added icons from lucide-react for better UX
   - Implemented smooth transitions and hover states

2. **Better Mobile Experience**
   - Sticky footer navigation for easy thumb reach
   - Large tap targets (48px minimum)
   - Responsive card layouts

3. **Smart Navigation**
   - Automatically skips hidden sections
   - Shows progress with visual indicators
   - Section chips for quick navigation

4. **Robust Error Handling**
   - Inline validation messages
   - Required field enforcement
   - Special consent validation

5. **Performance Optimizations**
   - Debounced autosave (400ms)
   - Optimistic UI updates
   - Minimal re-renders

## 🔧 Customization

### Modifying Questions

To change quiz questions, edit `seed/quiz.definition.json` and re-run the seed script:

```bash
npx tsx scripts/seed-quiz.ts
```

The seed script is idempotent - it will update existing questions without duplicating them.

### Adding New Question Types

1. Add the type to `question_type` enum in the database
2. Update `QuestionType` in `lib/quiz/types.ts`
3. Add a render function in `app/quiz/_components/Question.tsx`

### Styling

The quiz uses Tailwind CSS and inherits your app's design system:
- Primary colors from `tailwind.config.ts`
- Inter font from `app/layout.tsx`
- Consistent component styling from `app/_components/`

## 📊 Database Schema Overview

### Tables

- **quiz_sections** - Top-level sections (Entry, Sell Details, etc.)
- **quiz_questions** - Individual questions within sections
- **quiz_options** - Multiple choice options
- **quiz_sessions** - User quiz sessions (tracks progress)
- **quiz_responses** - Individual question responses

### Key Features

- **Row Level Security (RLS)** - Users can only access their own sessions/responses
- **Visibility Rules** - Stored as JSONB, evaluated client-side
- **Cascading Deletes** - Deleting a section removes its questions
- **Unique Constraints** - One response per question per session

## 🐛 Troubleshooting

### "Not authenticated" error
- Make sure you're logged in
- Check that Supabase auth is working
- Verify middleware is allowing `/quiz` routes

### Seed script fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that the database migration ran successfully
- Ensure `seed/quiz.definition.json` exists and is valid JSON

### Questions not showing
- Check browser console for errors
- Verify questions were seeded (check Supabase dashboard)
- Check visibility rules in the JSON

### Autosave not working
- Open browser DevTools Network tab
- Check for failed RPC calls to `upsert_quiz_response`
- Verify RLS policies allow inserts

## 🚀 Next Steps

Now that the quiz is set up, you can:

1. **Integrate with matching algorithm** - Use quiz responses to match clients with realtors
2. **Add analytics** - Track completion rates, drop-off points
3. **Build admin panel** - Allow non-technical users to edit questions
4. **Add email notifications** - Send confirmation emails after completion
5. **Create client dashboard** - Show quiz results and matches

## 📝 Notes

- The quiz currently requires authentication. To make it public (for lead gen), you'd need to:
  - Remove auth checks
  - Create anonymous sessions
  - Collect email at the end to claim the session
  
- The completion page shows a generic message. You may want to:
  - Show personalized insights based on answers
  - Display estimated timeline
  - Preview potential matches

- Consider adding:
  - A "Save & Exit" button
  - Email reminders for incomplete quizzes
  - Quiz analytics dashboard for admins

---

**Need help?** Check the code comments or reach out to the development team.

