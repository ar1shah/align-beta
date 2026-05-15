# Align — Architecture Reference

> Start with [README.md](../README.md) for project overview and quick start. This document covers the deeper technical and business context.

**See also:** [docs/API.md](./API.md) | [DATABASE.md](../DATABASE.md) | [docs/TESTING.md](./TESTING.md)

---

## Table of Contents

- [Business model](#business-model)
- [How it works — user flows](#how-it-works--user-flows)
- [Key architecture decisions](#key-architecture-decisions)
- [Data layer patterns](#data-layer-patterns)
- [Auth and role system](#auth-and-role-system)
- [Email notifications](#email-notifications)
- [Deployment and infrastructure](#deployment-and-infrastructure)
- [Roadmap](#roadmap)

---

## Business model

**Align** is a real estate **agent-matching** platform, not a listings platform. It connects homebuyers and sellers with real estate agents (targeting wholesalers) based on compatibility, preferences, and personality.

| Party | Role | Revenue |
|-------|------|---------|
| **Clients** | Use the platform for free to find their best-fit realtor | None (free) |
| **Realtors/Wholesalers** | Join to receive pre-qualified, matched leads | Receive closed-deal opportunities |
| **Align** | Matches clients to realtors | **30–35% referral fee** on deals that close |

Unlike Zillow, there are no listings. The value proposition is the quality of the match between client and agent, not property inventory.

---

## How it works — user flows

### Client flow

```
Homepage → Signup → OTP verification
    ↓
Matching quiz (9 sections, 45+ questions)
    ↓
Quiz submitted → waiting for admin assignment
    ↓
Admin assigns client to realtor
    ↓
Client notified via email → Dashboard shows matched realtor
```

The quiz captures: purchase/sale intent, budget, property type, location, timeline, and communication preferences.

### Realtor flow

```
Signup → Onboarding (profile + MSA signing)
    ↓
Receives assigned leads in Kanban dashboard
    ↓
Manages leads: New → Working → Nurture → Client / Lost
    ↓
Creates appointments, converts leads to CRM clients
    ↓
Tracks deals and payouts
```

The Master Service Agreement (MSA) is signed digitally during onboarding and stored as a `referral_contracts` record.

### Admin flow

```
Login → KPI dashboard (clients, realtors, utilization)
    ↓
Review new quiz submissions and client queue
    ↓
Assign client to realtor (or reassign / unassign)
    ↓
Email notifications sent to both parties
    ↓
Monitor audit logs, manage capacities, export data
```

---

## Key architecture decisions

### 1. Separate `clients` and `crm_clients` tables

- `clients` (admin system) holds the quiz-submitting user record and assignment history.
- `crm_clients` (realtor CRM) holds the realtor's working client record after conversion.
- These are intentionally decoupled: admin workflows are independent of the realtor's CRM. An assignment-sync trigger creates a `leads` record in the realtor's pipeline when an assignment is made. The realtor then promotes a lead to a `crm_clients` row at their discretion.

### 2. Row Level Security (RLS) as the primary authorization layer

Every table has RLS enabled. The database enforces:
- Admins have full read/write access to all tables (via `is_admin()` helper function).
- Realtors can only read/write their own records (`realtor_id = auth.uid()`).
- Clients can only read/write their own data (`user_id = auth.uid()`).

This means even if a request bypasses application-layer checks, the database will reject unauthorized access. The app's middleware and layout redirects are a UX layer on top of this, not the sole security boundary.

### 3. Server Components first

Most pages are React Server Components (RSC). Client components (`'use client'`) are used only for interactive elements: modals, forms with controlled state, drag-and-drop (Kanban), and real-time subscriptions. This pattern improves performance, reduces client bundle size, and enables direct database calls without an intermediate API.

### 4. Admin mutations via Server Actions, realtor mutations via REST handlers

Admin and quiz mutations use Next.js Server Actions (`'use server'` functions called directly from forms/components). This avoids boilerplate route files for admin operations and allows `revalidatePath()` to refresh cached data after mutations.

Realtor mutations (lead updates, deal creation, etc.) use conventional `app/api/**/route.ts` handlers. This separation reflects that realtor interactions are typically triggered from highly interactive client components (Kanban DnD, modals) where calling a route handler from `fetch` is more natural.

### 5. Quiz content in the database

Quiz sections, questions, options, and conditional visibility rules are all stored in `quiz_*` tables — not hardcoded. The seed script (`npm run seed:quiz`) is idempotent and can be re-run safely to update question content without a code change. This means product owners can iterate on quiz copy via database updates.

### 6. Immutable audit trail

All admin actions (assignments, status changes, capacity updates) are logged to the `audit_logs` table with actor ID, action type, affected entity, and metadata. Logs are append-only (no update/delete RLS policies on that table), making them suitable for compliance and debugging.

### 7. Realtime lead delivery

The realtor Kanban subscribes to Supabase Realtime on the `leads` table. When an admin assigns a new client, the assignment-sync trigger creates a lead, and Supabase pushes the update to any subscribed realtor without a page refresh.

---

## Data layer patterns

All database access goes through `lib/db/*.ts` modules, which are called from Server Components and Server Actions. There is no ORM — queries use the Supabase JS client with typed generics.

| Module | Responsibility |
|--------|---------------|
| `lib/db/admin.ts` | Clients, realtors, assignments, KPIs |
| `lib/db/leads.ts` | Realtor lead pipeline |
| `lib/db/appointments.ts` | Appointment records |
| `lib/db/deals.ts` | Deal pipeline |
| `lib/db/clients.ts` | CRM clients |
| `lib/db/payouts.ts` | Payout records |
| `lib/db/referrals.ts` | Referral contracts |
| `lib/db/notes.ts` | Client notes |
| `lib/db/profile.ts` | Profile reads |

API route handlers (`app/api/**`) use `createServerSupabaseClient()` from `lib/supabaseServer.ts`, which reads the session from cookies. Browser components use `lib/supabaseClient.ts`.

---

## Auth and role system

Supabase Auth handles identity (email + password, OTP). On every signup, a database trigger (`handle_new_user`) creates a corresponding row in `profiles` with `role = 'client'`.

Roles are changed manually via SQL for admin/realtor accounts:

```sql
UPDATE profiles SET role = 'realtor' WHERE email = 'agent@example.com';
UPDATE profiles SET role = 'admin'   WHERE email = 'admin@example.com';
```

A `sync-profiles-triggers.sql` migration ensures that when a role changes to `realtor`, the corresponding `realtors` table record is created automatically.

Route protection layers, in order of application:

1. **`middleware.ts`** — Checks session presence for `/dashboard`, `/realtor/*`, `/admin/*`; checks role for `/realtor` and `/admin`.
2. **Layout components** — `app/admin/layout.tsx` and `app/realtor/layout.tsx` re-check role and redirect if wrong.
3. **RLS policies** — Final enforcement at the database level.

---

## Email notifications

Email is sent via [Resend](https://resend.com) using `lib/email.ts`. Notifications are fired asynchronously from admin server actions (they do not block the mutation response).

| Trigger | Recipients |
|---------|-----------|
| Client assigned to realtor | Client (match notification), Realtor (new lead notification) |
| Client reassigned | Previous realtor, new realtor, client |
| Client unassigned | No email currently |

Templates live in `lib/email/templates.ts`. The sender domain defaults to `app.alignagentsre.com`; override with `NEXT_PUBLIC_APP_URL` for local testing.

---

## Deployment and infrastructure

| Layer | Technology | Notes |
|-------|-----------|-------|
| Hosting | Vercel | Auto-deploys from `main` branch |
| Database | Supabase (PostgreSQL) | Managed Postgres with Auth and Realtime |
| Storage | Supabase Storage | `documents` bucket for deal attachments |
| Email | Resend | Transactional only (no marketing) |
| SSL | Vercel / Cloudflare | Automatic |

### Production checklist

- [ ] All five environment variables set in Vercel dashboard
- [ ] Supabase Auth redirect URLs include the production domain
- [ ] Supabase Storage bucket policies reviewed
- [ ] Resend sender domain verified
- [ ] Error tracking (e.g. Sentry) configured
- [ ] Vercel Analytics enabled

---

## Roadmap

### Implemented (MVP)

- Full auth system (signup, OTP, login, password reset)
- 9-section matching quiz with 45+ questions, conditional logic, auto-save
- Admin panel: KPIs, client/realtor CRUD, assignments, quiz viewer, audit log, CSV export
- Realtor CRM: onboarding, leads Kanban, appointments, deals, payouts, realtime updates
- Email notifications via Resend

### Phase 2 — Enhanced operations

- [ ] SMS notifications for realtors
- [ ] Dashboard charts (assignments over time, conversion funnel)
- [ ] Client import from CSV
- [ ] SLA tracking (flag clients unassigned >24h)

### Phase 3 — Automation & intelligence

- [ ] Automated assignment rules (round-robin, capacity-based)
- [ ] Realtor performance metrics (conversion rate, response time)
- [ ] Matching algorithm (score realtors based on quiz answers)
- [ ] Match percentage display on client dashboard

### Phase 4 — Integrations

- [ ] Google / Outlook calendar sync
- [ ] DocuSign / HelloSign for real MSA e-signatures
- [ ] Stripe for payout processing
- [ ] External CRM integration

### Phase 5 — Scale & polish

- [ ] Multi-tenant support (multiple offices/brands)
- [ ] Role-based sub-admins (team leads)
- [ ] Advanced analytics dashboard
- [ ] Public REST API for external integrations
- [ ] React Native mobile app
