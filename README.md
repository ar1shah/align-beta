# Align - Authentication MVP

Modern authentication system for matching homebuyers/sellers with the right realtor. Built with Next.js 14+, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon public key from **Project Settings → API**
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure Supabase Authentication

#### Enable Email Authentication

1. Go to **Authentication → Providers → Email**
2. Enable both:
   - ✅ Email sign-in with OTP (6-digit code)
   - ✅ Email+Password
   - ✅ Require email confirmations for signups

#### Update Email Template

1. Go to **Authentication → Email Templates → Confirm signup**
2. Replace the template content with:

```html
<h2>Verify your email</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>Enter this code in the app to finish signing up.</p>
```

#### Configure URL Settings

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://www.app.alignagentsre.com`
3. Add **Redirect URLs** (allowlist):
   - `https://www.app.alignagentsre.com/*`
   - `https://app.alignagentsre.com/*`
   - `http://localhost:3000/*`
   - (Add your Vercel deployment URLs if applicable)

### 4. Run Database Migrations

Open the **SQL Editor** in your Supabase dashboard and run the SQL from `SETUP.sql` (see below or in the file).

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📋 Features

### ✅ Implemented (Auth MVP)

- **Public Home Page** - Landing with Login/Sign Up CTAs
- **Sign Up Flow** - Email, password, full name, phone + email OTP verification
- **Login** - Email/password authentication
- **Email Verification** - 6-digit OTP code sent to email
- **Forgot/Reset Password** - Email-based password recovery
- **Role-Based Dashboard** - Displays "Welcome to {Client/Realtor/Admin} dashboard"
- **Route Protection** - Middleware guards for authenticated pages
- **Environment Setup Page** - Friendly instructions when env vars are missing

### 🔐 User Roles

- **Client** (default) - Homebuyers/sellers
- **Realtor** - Real estate agents
- **Admin** - Platform administrators

## 🗂️ Project Structure

```
align-beta/
├── app/
│   ├── _components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Form.tsx
│   │   └── Input.tsx
│   ├── dashboard/         # Protected dashboard
│   ├── login/
│   ├── signup/
│   ├── verify-otp/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Home page
├── lib/
│   ├── auth.ts            # Auth helper functions
│   ├── supabaseClient.ts  # Browser Supabase client
│   └── supabaseServer.ts  # Server Supabase client
├── middleware.ts          # Route protection
├── .env.local.example     # Environment variable template
├── SETUP.sql              # Database schema
└── README.md
```

## 🔧 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (JS SDK v2)
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks

## 📝 Acceptance Criteria

All acceptance criteria from the master prompt have been implemented:

- ✅ Public home page with Login/Sign Up links
- ✅ Sign up with full name, email, phone, password
- ✅ Email OTP verification (6-digit code)
- ✅ Login with email/password
- ✅ Dashboard shows "Welcome to {Role} dashboard"
- ✅ Protected routes redirect to /login if unauthenticated
- ✅ Forgot/reset password flow works end-to-end
- ✅ Missing env vars show setup instructions
- ✅ Clean, responsive, modern UI

## 🎨 Design System

- **Typography**: Clean, modern sans-serif (Inter)
- **Colors**: Primary blue palette with neutral grays
- **Spacing**: Generous whitespace
- **Corners**: Rounded (12-24px)
- **Shadows**: Subtle, layered depth
- **Interactive States**: Smooth transitions, clear hover/focus states

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in project settings
4. Update Supabase redirect URLs to include your Vercel domain
5. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Always use environment variables for secrets
- Supabase anon key is safe for client-side use (RLS protects data)
- Middleware validates sessions on protected routes

## 📚 Next Steps

**🛑 STOP HERE** - This is the Auth MVP milestone.

Future milestones (only proceed when approved):
- Role management UI
- Client intake form
- Realtor matching algorithm
- Admin dashboard features
- Real-time notifications

## 🐛 Troubleshooting

### "Environment variables missing" on first run
- Create `.env.local` with your Supabase credentials
- Restart the dev server

### Email not received for verification
- Check spam folder
- Verify email provider settings in Supabase
- Check Supabase logs under Authentication → Logs

### "Invalid verification code"
- Code expires after 1 hour
- Request a new code by signing up again
- Ensure email matches exactly

### Dashboard not showing role correctly
- Check that the SQL schema was run successfully
- Verify the `profiles` table exists in Supabase
- Check the trigger is active

## 📄 License

Proprietary - Align RE Inc.

---

Built with ❤️ by the Align team

