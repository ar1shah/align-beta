# Align — Testing Guide

This document is the manual QA guide for Align. There is currently no automated test suite (no Jest, Vitest, or Playwright configuration). Every feature described here should be verified by hand against a running local or staging instance.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Smoke tests (build + lint)](#smoke-tests-build--lint)
- [Test user setup](#test-user-setup)
- [Client flow](#client-flow)
- [Admin flow](#admin-flow)
- [Realtor flow](#realtor-flow)
- [Auth & role guard edge cases](#auth--role-guard-edge-cases)
- [Email notifications](#email-notifications)
- [Regression matrix](#regression-matrix)
- [Future automated testing](#future-automated-testing)

---

## Prerequisites

Before running any manual tests:

1. A Supabase project with all migrations applied (see [DATABASE.md](../DATABASE.md) for the correct order).
2. The quiz seeded: `npm run seed:quiz`.
3. Three test accounts created in Supabase Auth with roles set as described below.
4. `.env.local` configured with valid `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `RESEND_API_KEY` for email tests.
5. Dev server running: `npm run dev`.

---

## Smoke tests (build + lint)

Run these before any manual session to catch regressions early:

```bash
npm run lint    # Zero ESLint errors expected
npm run build   # Production build must complete without errors
```

A clean build with no TypeScript or lint errors is the baseline. Do not proceed with manual testing if either command fails.

---

## Test user setup

Create these three users via the signup flow or directly in Supabase Auth, then set roles with SQL:

| Role | Suggested email | Role SQL |
|------|-----------------|----------|
| **Admin** | `admin@test.local` | `UPDATE profiles SET role = 'admin' WHERE email = 'admin@test.local';` |
| **Realtor** | `realtor@test.local` | `UPDATE profiles SET role = 'realtor' WHERE email = 'realtor@test.local';` |
| **Client** | `client@test.local` | Default — no SQL needed (role is `client` by signup trigger) |

> Use a password manager or note the passwords; they are not committed to the repo.

---

## Client flow

**Logged in as:** `client@test.local`

### 1. Signup and email verification

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | Navigate to `/signup`, enter email + password | Redirected to `/verify-otp` |
| 2 | Enter OTP from Supabase confirmation email | Redirected to `/quiz` (new user) |
| 3 | Revisit `/login` with same credentials | Redirected to `/quiz` or `/dashboard` (if quiz completed) |

### 2. Password reset

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | Navigate to `/forgot-password`, enter email | "Email sent" confirmation shown |
| 2 | Click reset link in email | Redirected to `/reset-password` |
| 3 | Enter and confirm new password | Redirected to `/login` |

### 3. Matching quiz

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | Begin quiz at `/quiz` | First section (`entry`) loads |
| 2 | Answer "Are you buying or selling?" | Conditional sections appear/disappear correctly based on answer |
| 3 | Navigate forward through all 9 sections | Progress bar advances; answered sections remain saved |
| 4 | Close browser mid-quiz, reopen `/quiz` | Answers persist; quiz resumes where left off |
| 5 | Submit final section | Redirected to `/quiz/complete` |
| 6 | Visit `/dashboard` | Shows "Waiting for match" state (no assignment yet) |

### 4. Post-assignment dashboard

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | (Admin assigns client — see Admin flow step 3) | — |
| 2 | Client refreshes `/dashboard` | Shows assigned realtor's name and contact info |

---

## Admin flow

**Logged in as:** `admin@test.local`

### 1. Dashboard KPIs

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | Navigate to `/admin` | KPI cards show counts for clients, realtors, and utilization |
| 2 | Check work queues | Unassigned clients and recent submissions visible |

### 2. Client and realtor management

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/admin/clients` | List of all clients with status badges |
| 2 | Click a client row | Detail page `/admin/clients/[id]` shows quiz answers and notes |
| 3 | Add a note | Note appears in notes section immediately |
| 4 | Update client status | Status badge updates; audit log entry created |
| 5 | `/admin/realtors` | List of realtors with capacity and active status |
| 6 | Toggle a realtor's active status | Changes reflected in list and realtor's dashboard |
| 7 | Edit realtor capacity | New value saved; utilization KPI updates |

### 3. Assignment

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/admin/assignments` | Shows current assignments |
| 2 | Assign an unassigned client to a realtor | Assignment appears; client's dashboard updates |
| 3 | If `RESEND_API_KEY` is set | Both client and realtor receive email notifications |
| 4 | Reassign client to a different realtor | Old assignment closed; new one created; reassignment emails sent |
| 5 | Unassign client | Assignment removed; reason saved in audit log |

### 4. Quiz viewer and export

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/admin/quizzes` | All quiz sessions listed |
| 2 | Click a session | `/admin/quizzes/[sessionId]` shows all answers |
| 3 | Click "Export CSV" | CSV file downloads with correct question/answer columns |

### 5. Audit log

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/admin/audit` | Chronological log of all admin actions |
| 2 | Verify entries from steps above | Each assignment, status change, and note has a corresponding entry |

---

## Realtor flow

**Logged in as:** `realtor@test.local`

### 1. Onboarding

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | Login for the first time | Redirected to `/realtor/onboarding` |
| 2 | Fill profile (license, brokerage, coverage areas) | Fields save correctly |
| 3 | Sign MSA | `referral_contracts` row created with `type = 'msa'`; redirected to `/realtor` |

### 2. Leads Kanban

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/realtor/leads` | Kanban board shows assigned leads in "New" column |
| 2 | Drag a lead card to "Working" | Stage updates in DB; card moves visually |
| 3 | Click "Set Next Touch" on a lead | Date/time saved; visible on card |
| 4 | Click "Decline" on a lead | Lead marked `declined_by_realtor = true`; removed from active pipeline |
| 5 | Click "Convert to Client" on a lead | Lead stage becomes `"client"`; CRM client record created |
| 6 | Open a second browser tab, have admin assign a new lead | Lead appears in Kanban in real time without page refresh (Supabase Realtime) |

### 3. Appointments

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/realtor/appointments` | Existing appointments listed |
| 2 | Create new appointment | Form submits; appointment appears in list |

### 4. Deals pipeline

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/realtor/deals` | Deals list or pipeline shown |
| 2 | Create new deal | Deal record created with correct stage |

### 5. Settings

| Step | Action | Expected result |
|------|--------|----------------|
| 1 | `/realtor/settings` | Profile fields pre-filled |
| 2 | Update name/phone | `profiles` table updated |
| 3 | Update license/brokerage | `realtor_profile` table upserted |

---

## Auth & role guard edge cases

These tests verify that routing protections work correctly.

| Scenario | URL | Expected result |
|----------|-----|----------------|
| Unauthenticated user visits `/admin` | `/admin` | Redirected to `/login` |
| Unauthenticated user visits `/realtor` | `/realtor` | Redirected to `/login` |
| Unauthenticated user visits `/dashboard` | `/dashboard` | Redirected to `/login` |
| Client visits `/admin` | `/admin` | Redirected to `/dashboard` |
| Client visits `/realtor` | `/realtor` | Redirected to `/dashboard` |
| Realtor visits `/admin` | `/admin` | Redirected to `/dashboard` |
| Admin visits `/quiz` | `/quiz` | Should redirect (admin has no quiz flow) — verify redirect target |

---

## Email notifications

These tests require a valid `RESEND_API_KEY` in `.env.local` and a verified sender domain in Resend.

| Trigger | Recipient | Expected email |
|---------|-----------|---------------|
| Admin assigns client to realtor | Client | "You've been matched with a realtor" notification |
| Admin assigns client to realtor | Realtor | "New lead assigned to you" notification |
| Admin reassigns client | Previous realtor | Reassignment notification |
| Admin reassigns client | New realtor | New lead notification |
| Admin reassigns client | Client | Updated match notification |

> If `RESEND_API_KEY` is not set, assignments still succeed — email failures are caught and logged to the console but do not block the action.

---

## Regression matrix

A quick-reference table for verifying core paths after any significant change.

| Feature | Route | Action | Expected outcome |
|---------|-------|--------|-----------------|
| Homepage loads | `/` | Visit | Page renders without errors |
| Signup | `/signup` | Submit form | OTP email received |
| Login — client | `/login` | Login | Redirect to `/quiz` or `/dashboard` |
| Login — realtor | `/login` | Login | Redirect to `/realtor` (or `/realtor/onboarding`) |
| Login — admin | `/login` | Login | Redirect to `/admin` |
| Quiz auto-save | `/quiz/[sectionKey]` | Answer question | Response saved within ~400ms |
| Quiz conditional logic | `/quiz/[sectionKey]` | Change "buy/sell" answer | Irrelevant sections hide/show |
| Admin assignment | `/admin/assignments` | Assign client | Lead created in realtor's Kanban |
| Realtor Kanban DnD | `/realtor/leads` | Drag card | Stage updated in DB |
| Audit log | `/admin/audit` | Any admin action | Entry logged |
| CSV export | `/admin/quizzes/[id]` | Export | Valid CSV downloaded |
| Sign out | Any page | Click sign out | Session cleared, redirect to `/login` |

---

## Future automated testing

The following areas are highest priority for a future Playwright E2E suite:

1. **Quiz completion flow** — Simulate a full 9-section quiz submission end-to-end.
2. **Admin assignment flow** — Create client, assign to realtor, verify lead appears.
3. **Role-based redirects** — Parameterized tests for each role × each protected route.
4. **Realtime lead delivery** — Two-context test: admin assigns, realtor sees update without refresh.

For unit testing, the quiz conditional visibility logic (`lib/quiz/`) and the `lib/db/*` data access functions are the best candidates for isolated Jest/Vitest tests.

To add Playwright to this project:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Then create `playwright.config.ts` and an `e2e/` directory alongside `app/`.
