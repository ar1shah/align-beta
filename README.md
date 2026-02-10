# Align

A real estate matching platform that connects buyers/sellers with the right realtors based on preferences, needs, and personality. Built for real estate wholesalers with a referral-based business model.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run database migrations (see DATABASE.md)
# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Documentation

| File | Description |
|------|-------------|
| **[CONTEXT.md](./CONTEXT.md)** | Complete project overview, business model, features, and architecture |
| **[DATABASE.md](./DATABASE.md)** | Full database schema reference with all tables, RLS policies, and migrations |

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel

## Project Structure

```
align-beta/
├── app/              # Next.js pages & API routes
│   ├── admin/        # Admin dashboard
│   ├── quiz/         # Client matching quiz
│   ├── realtor/      # Realtor dashboard
│   └── api/          # API endpoints
├── lib/              # Shared utilities & DB access
├── migrations/       # SQL migration files
├── seed/             # Quiz seed data
└── scripts/          # Utility scripts
```

## Key Features

- **Client Quiz**: 9-section questionnaire with conditional logic and auto-save
- **Admin Panel**: Client management, realtor assignments, audit logs
- **Realtor Dashboard**: Lead pipeline, appointments, deals, payouts

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For seeding only
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run seed:quiz    # Seed quiz questions
```

## Deployment

Deployed on **Vercel** with automatic CI/CD from the main branch.

- Production: https://app.alignagentsre.com
- Database: Supabase (PostgreSQL)

---

**Align RE Inc.** | Built with Next.js, Supabase & Tailwind CSS
