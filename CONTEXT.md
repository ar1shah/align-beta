
# Align - Project Context

## What is Align?

**Align** is a real estate matching platform that connects buyers and sellers with real estate agents (specifically targeting wholesalers) based on their needs, preferences, and personality. Unlike listing-focused platforms like Zillow, Align focuses on **agent matching** rather than property listings.

### Business Model

- **Clients** → Use the platform for free to find their "best match" realtor
- **Realtors/Wholesalers** → Join the platform, verify their license, and receive pre-qualified leads
- **Revenue** → Align earns **30-35% referral fee** on closed deals from leads generated through the platform

### Target Market

- Real estate wholesalers looking for quality buyer/seller leads
- Homebuyers and sellers who want personalized agent matching
- Geographic focus: Initially US-based with scalable architecture

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Hosting** | Vercel |
| **Domain** | app.alignagentsre.com |

---

## How It Works

### Client Flow
1. Client lands on homepage and takes a matching quiz
2. Quiz captures: budget, property type, location, timeline, communication preferences
3. Quiz responses are saved and linked to client profile
4. Admin reviews submissions and assigns clients to matching realtors
5. Client receives email confirmation and gets connected with realtor

### Realtor Flow
1. Realtor signs up and completes profile (license, brokerage, coverage areas)
2. Signs Master Service Agreement (MSA) agreeing to referral fee terms
3. Receives assigned leads in their dashboard (Kanban board)
4. Manages leads through stages: New → Working → Nurture → Client/Lost
5. Tracks deals, appointments, and payouts

### Admin Flow
1. Admin views all quiz submissions and client data
2. Assigns/reassigns clients to realtors based on capacity and fit
3. Manages realtor profiles (capacity, active status)
4. Monitors audit logs and system health
5. Tracks KPIs: assignments, conversion rates, utilization

---

## Project Structure

```
align-beta/
├── app/                          # Next.js App Router pages
│   ├── _components/              # Shared UI components (Button, Card, Input, Form)
│   ├── admin/                    # Admin dashboard (/admin/*)
│   ├── quiz/                     # Client matching quiz (/quiz/*)
│   ├── realtor/                  # Realtor dashboard (/realtor/*)
│   ├── api/                      # API routes
│   ├── login/                    # Auth pages
│   ├── signup/
│   ├── verify-otp/
│   ├── forgot-password/
│   ├── reset-password/
│   └── dashboard/                # Generic dashboard (redirects by role)
├── lib/                          # Shared utilities
│   ├── db/                       # Database access layer
│   ├── quiz/                     # Quiz logic (types, visibility)
│   ├── auth.ts                   # Auth helpers
│   ├── supabaseClient.ts         # Browser Supabase client
│   ├── supabaseServer.ts         # Server Supabase client
│   └── utils.ts                  # General utilities
├── migrations/                   # SQL migrations
├── seed/                         # Seed data (quiz definition)
├── scripts/                      # Utility scripts (seeding)
├── public/                       # Static assets
└── middleware.ts                 # Route protection
```

---

## Feature Checklist

### ✅ Implemented Features

#### Authentication System
- [x] Email/password signup with OTP verification
- [x] Login with email/password
- [x] Password reset flow (forgot password → email → reset)
- [x] Role-based access (client, realtor, admin)
- [x] Middleware route protection
- [x] Session management with cookies
- [x] Auto-profile creation on signup

#### Client Matching Quiz
- [x] 9-section quiz with 45+ questions
- [x] Question types: single choice, multi-choice, text, number, money, address, yes/no, phone, email, date
- [x] Conditional visibility (show/hide based on previous answers)
- [x] Auto-save with debouncing (400ms)
- [x] Resume capability (progress persists)
- [x] Progress tracking with visual indicator
- [x] Mobile-optimized with sticky footer navigation

#### Admin Dashboard
- [x] Dashboard with KPI cards (clients, realtors, utilization)
- [x] Client management (list, detail, status updates)
- [x] Realtor management (list, detail, capacity, active toggle)
- [x] Assignment system (assign/unassign/reassign clients to realtors)
- [x] Quiz submission viewer (detailed answers, export CSV)
- [x] Audit log (track all admin actions)
- [x] Bulk assignment operations
- [x] Work queues (unassigned clients, recent submissions)

#### Realtor Dashboard
- [x] Overview dashboard (stats, today's appointments)
- [x] Onboarding with MSA e-signature
- [x] Leads pipeline (Kanban with drag-and-drop)
- [x] Lead actions (set follow-up, convert to client, decline)
- [x] Appointments management (create, view)
- [x] CRM clients table
- [x] Deals pipeline (stages, property info)
- [x] Referral contracts viewer
- [x] Payouts table (read-only)
- [x] Settings & profile management
- [x] Realtime lead updates via Supabase subscriptions

### 🔲 Planned Features (Not Yet Built)

#### Phase 2: Enhanced Operations
- [x] Email notifications on assignment (to client and realtor via Resend)
- [ ] SMS notifications for realtors
- [ ] Dashboard charts (assignments over time, conversion funnel)
- [ ] Client import from CSV
- [ ] Advanced reporting page
- [ ] SLA tracking (highlight clients unassigned >24h)
- [ ] Client tagging system improvements

#### Phase 3: Automation & Intelligence
- [ ] Automated assignment rules (round-robin, capacity-based)
- [ ] Realtor performance metrics (conversion rate, response time)
- [ ] Client lifecycle stages (custom statuses)
- [ ] Matching algorithm (score realtors based on quiz answers)
- [ ] Match percentage display

#### Phase 4: Integrations
- [ ] External CRM integration
- [ ] Google/Outlook calendar sync
- [ ] Real e-signature provider (DocuSign, HelloSign)
- [ ] Custom SMTP for branded emails
- [ ] Stripe/payment integration for payouts

#### Phase 5: Scale & Polish
- [ ] Multi-tenant support (multiple offices)
- [ ] Role-based sub-admins (team leads)
- [ ] Advanced analytics dashboard
- [ ] Public API for external integrations
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## Environment Setup

### Required Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For quiz seeding script only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email notifications via Resend (required for notifications)
RESEND_API_KEY=your-resend-api-key
```

### Setup Steps

1. **Install dependencies**: `npm install`
2. **Create `.env.local`** with Supabase credentials
3. **Run database migrations** (see DATABASE.md):
   - `SETUP.sql` - Core profiles table
   - `seed/quiz.sql` - Quiz tables
   - `migrations/admin-panel.sql` - Admin tables
4. **Seed quiz questions**: `npm run seed:quiz`
5. **Set admin role**: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';`
6. **Start dev server**: `npm run dev`

---

## Key Architecture Decisions

### 1. Separate Client Tables
- `clients` table (admin system) is separate from `crm_clients` (realtor CRM)
- Keeps quiz/admin workflows independent from realtor-specific workflows
- Enables future sync mechanism if needed

### 2. Row Level Security (RLS)
- All tables have RLS enabled
- Admins have full access to all tables
- Realtors can only see their assigned clients
- Clients can only see their own data

### 3. Server Components First
- Most pages use React Server Components (RSC)
- Client components only for interactivity (modals, forms, drag-drop)
- Better performance and SEO

### 4. Quiz Content in Database
- Questions stored in DB, not hardcoded
- Easy to update without code changes
- Seed script is idempotent (can re-run safely)

### 5. Audit Trail
- All admin actions logged to `audit_logs` table
- Includes actor, action, entity, and metadata
- Immutable for compliance

---

## Deployment

- **Hosting**: Vercel (automatic deploys from main branch)
- **Database**: Supabase (PostgreSQL)
- **Domain**: app.alignagentsre.com
- **SSL**: Automatic via Vercel/Cloudflare

### Production Checklist
- [ ] Environment variables set in Vercel
- [ ] Supabase redirect URLs include production domain
- [ ] Custom SMTP configured for branded emails
- [ ] Error tracking (Sentry) configured
- [ ] Analytics enabled (Vercel Analytics)

---

## Contact & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com
- **Production URL**: https://app.alignagentsre.com

---

*Last updated: January 2026*
