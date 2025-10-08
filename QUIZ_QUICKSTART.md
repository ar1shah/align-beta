# Client Quiz - Quick Start Checklist

## ✅ What You Need to Do

### 1. Install Dependencies
```bash
npm install
```

This will install the `tsx` package needed to run the seed script.

### 2. Set Up Environment Variables

Make sure your `.env.local` file has these three variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy all three values

### 3. Run Database Migration

**Option A: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy the entire contents of `seed/quiz.sql`
6. Paste and click **Run**

**Option B: Copy from Setup Guide**
The SQL is also in `QUIZ_SETUP.md` if you prefer to copy from there.

### 4. Seed the Quiz Questions

Run this command in your terminal:

```bash
npm run seed:quiz
```

You should see:
```
🌱 Starting quiz seeding...
✅ Loaded seed file (version: v1)
📁 Processing section: Let's get you matched (entry)
...
🎉 Seeding complete!
```

### 5. Start the App

```bash
npm run dev
```

### 6. Test It Out

1. Open http://localhost:3000/quiz
2. Log in (or sign up if needed)
3. Start the quiz and answer some questions
4. Refresh the page - your answers should be saved!
5. Complete the quiz to see the success page

---

## 🎉 That's It!

The quiz is now fully functional. Check out `QUIZ_SETUP.md` for more details about customization, troubleshooting, and architecture.

## 📊 What Was Built

### Files Created:
- **9 sections** with 45+ questions
- **Auto-save** with 400ms debouncing
- **Conditional visibility** - questions show/hide based on previous answers
- **Progress tracking** - visual progress bar and section chips
- **Mobile-optimized** - sticky footer, large tap targets
- **Resume capability** - users can leave and come back

### Database Tables:
- `quiz_sections` - Quiz sections
- `quiz_questions` - Questions within sections
- `quiz_options` - Multiple choice options
- `quiz_sessions` - User progress tracking
- `quiz_responses` - User answers

### Routes:
- `/quiz` - Landing page
- `/quiz/[sectionKey]` - Section pages
- `/quiz/complete` - Completion page
- `/api/quiz/structure` - JSON API (optional)

## 🔧 Need to Change Questions?

1. Edit `seed/quiz.definition.json`
2. Run `npm run seed:quiz` again
3. Refresh your browser

The seed script is idempotent - it won't duplicate questions, just update them.

## ❓ Troubleshooting

**"Not authenticated" error**
- Make sure you're logged in
- The quiz requires authentication by default

**Seed script fails**
- Check that all three env variables are set correctly
- Make sure the database migration ran successfully

**No questions showing**
- Check browser console for errors
- Verify questions were seeded (check Supabase dashboard → Table Editor → quiz_questions)

---

For detailed documentation, see **QUIZ_SETUP.md**

