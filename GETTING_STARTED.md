# Getting Started with Align - Step by Step

This guide will walk you through setting up the Align authentication MVP from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

Open your terminal in the project root and run:

```bash
npm install
```

This will install all necessary packages including Next.js, React, Supabase, and Tailwind CSS.

### 2️⃣ Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click **"New Project"**
3. Fill in:
   - Project name: `align-auth` (or whatever you prefer)
   - Database password: (choose a strong password)
   - Region: (choose closest to you)
4. Click **"Create new project"** and wait ~2 minutes

### 3️⃣ Get Your Supabase Credentials

1. In your Supabase project, click the **⚙️ Settings** icon (bottom left)
2. Go to **Settings → API**
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 4️⃣ Create Environment File

1. In your project root, create a new file called `.env.local`
2. Paste this content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit this file to git! It's already in `.gitignore`.

### 5️⃣ Configure Supabase Email Authentication

#### A. Enable Email Provider

1. In Supabase, go to **Authentication → Providers**
2. Find **Email** and click it
3. Make sure these are enabled:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email**
4. Click **Save**

#### B. Update Email Template

1. Go to **Authentication → Email Templates**
2. Select **Confirm signup** from the dropdown
3. Replace the entire content with:

```html
<h2>Verify your email</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>Enter this code in the app to finish signing up.</p>
```

4. Click **Save**

#### C. Configure URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `https://www.app.alignagentsre.com`
3. In **Redirect URLs**, add each of these on a new line:
   ```
   https://www.app.alignagentsre.com/*
   https://app.alignagentsre.com/*
   http://localhost:3000/*
   ```
4. Click **Save**

### 6️⃣ Run Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the `SETUP.sql` file from this project
4. Copy and paste the entire contents into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see ✅ "Success. No rows returned"

This creates:
- `profiles` table
- User role enum (`client`, `realtor`, `admin`)
- Auto-profile creation trigger
- Row-level security policies

### 7️⃣ Start the Development Server

Back in your terminal, run:

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 8️⃣ Test the Application

Open your browser and go to [http://localhost:3000](http://localhost:3000)

#### Test Sign Up Flow

1. Click **"Sign Up"**
2. Fill in the form:
   - Full Name: `Test User`
   - Email: Use a real email you can access
   - Phone: `555-123-4567`
   - Password: `password123`
3. Click **"Sign Up"**
4. Check your email for a 6-digit verification code
5. Enter the code on the verification page
6. You should be redirected to the dashboard! 🎉

#### Test the Dashboard

You should see: **"Welcome to Client dashboard"**

This confirms:
- ✅ Authentication working
- ✅ Profile created automatically
- ✅ Role assigned correctly

#### Test Logout & Login

1. Click **"Log Out"**
2. Click **"Log In"** from the home page
3. Enter your email and password
4. You should be back at the dashboard

#### Test Password Reset

1. Log out
2. Go to Login page
3. Click **"Forgot password?"**
4. Enter your email
5. Check your email for the reset link
6. Click the link and set a new password
7. Log in with your new password

## ✅ Verification Checklist

Make sure all these work:

- [ ] Home page shows "Align" with Login/Sign Up buttons
- [ ] Sign up creates account and sends verification email
- [ ] Email OTP verification works
- [ ] Dashboard shows "Welcome to Client dashboard"
- [ ] Login with email/password works
- [ ] Logout works
- [ ] Dashboard is protected (redirects to login if not authenticated)
- [ ] Forgot password sends email
- [ ] Reset password link works
- [ ] UI is clean and responsive

## 🎯 What You Built

You now have a fully functional authentication system with:

- **Email/password authentication**
- **Email verification via OTP**
- **Password reset flow**
- **Role-based access** (client/realtor/admin)
- **Protected routes** with middleware
- **Modern, responsive UI**
- **Secure database** with RLS policies

## 🚀 Next Steps

**IMPORTANT**: This is just the Auth MVP. Do NOT proceed to build more features until approved.

Once approved, future milestones include:
- Client intake questionnaire
- Realtor profiles & matching algorithm
- Admin dashboard for user management
- Real-time notifications
- And more...

## 🐛 Common Issues

### "Environment variables missing" error
- Make sure `.env.local` exists in the project root
- Check that variables are correctly named (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Restart the dev server after creating/editing `.env.local`

### "Failed to sign up"
- Check that Email provider is enabled in Supabase
- Verify the email template is updated
- Make sure "Confirm email" is enabled

### "Invalid verification code"
- Check spam folder for the email
- Code expires after 1 hour
- Make sure you're entering the 6-digit code exactly

### Dashboard shows wrong role
- Run the SQL schema again in Supabase
- Check that the trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

### Can't access dashboard (redirects to login)
- Clear browser cookies
- Check middleware.ts is properly configured
- Verify session is being set after login

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💬 Need Help?

Check the main `README.md` for more detailed information about the project structure and architecture.

---

Happy coding! 🎉

