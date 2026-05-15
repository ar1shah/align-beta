# Align — API Reference

This document covers every server-side API surface in the application: Next.js Route Handlers (REST-style), Next.js Server Actions, and client-side Supabase Auth calls.

**Base URL (local):** `http://localhost:3000`

---

## Table of Contents

- [Authentication notes](#authentication-notes)
- [REST Route Handlers](#rest-route-handlers)
  - [Auth](#auth)
  - [Quiz](#quiz)
  - [Realtor — Profile](#realtor--profile)
  - [Realtor — Leads](#realtor--leads)
  - [Realtor — Appointments](#realtor--appointments)
  - [Realtor — CRM Clients](#realtor--crm-clients)
  - [Realtor — Deals](#realtor--deals)
- [Server Actions](#server-actions)
  - [Admin Actions](#admin-actions)
  - [Quiz Actions](#quiz-actions)
- [Client-side Supabase Auth](#client-side-supabase-auth)
- [Error shape](#error-shape)

---

## Authentication notes

The app uses three layers of protection in combination:

| Layer | Scope | Mechanism |
|-------|-------|-----------|
| **Middleware** (`middleware.ts`) | Page routes (`/admin/*`, `/realtor/*`, `/dashboard`) | Checks Supabase session and role via cookie; redirects unauthenticated/wrong-role requests |
| **Supabase RLS** | All tables in PostgreSQL | Row-level policies enforce `is_admin()`, `is_realtor()`, `is_client()` at the DB layer |
| **Explicit session check** | Specific route handlers | Some handlers (`sign-msa`, `convert-to-client`) call `supabase.auth.getSession()` and return `401` if absent |

> **Note:** Several realtor mutation routes (`update-stage`, `decline`, `set-next-touch`, `appointments/create`, `clients/create`, `deals/create`) rely on Supabase RLS rather than an explicit session check in the handler. Access is still enforced by the DB—unauthenticated requests will fail at the query level.

All requests should be made from within authenticated browser sessions. There is no public token-based API key system.

---

## REST Route Handlers

Route handlers live under `app/api/`. All responses are JSON (`Content-Type: application/json`).

### Success envelope

```json
{ "success": true, "data": { ... } }
```

### Error envelope

```json
{ "error": "Human-readable message" }
```

---

### Auth

#### `POST /api/auth/signout`

Signs out the current user and redirects to `/login`.

**Source:** `app/api/auth/signout/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | No (signs out any session present) |
| Response | `302` redirect to `/login` |

**Request body:** none

---

### Quiz

#### `GET /api/quiz/structure`

Returns the full quiz schema: sections, questions, and options — sorted by `sort_order`. Used by the quiz renderer to build the dynamic form.

**Source:** `app/api/quiz/structure/route.ts`

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth required | No (auth optional; returns `user_id` if authenticated) |
| Tables read | `quiz_sections`, `quiz_questions`, `quiz_options` |

**Response:**

```json
{
  "sections": [
    {
      "id": "uuid",
      "key": "entry",
      "title": "Let's Get Started",
      "sort_order": 0,
      "quiz_questions": [
        {
          "id": "uuid",
          "key": "purpose",
          "prompt": "Are you looking to buy or sell?",
          "type": "single_choice",
          "required": true,
          "quiz_options": [
            { "id": "uuid", "label": "Buy", "value": "buy", "sort_order": 0 },
            { "id": "uuid", "label": "Sell", "value": "sell", "sort_order": 1 }
          ]
        }
      ]
    }
  ],
  "user_id": "uuid-or-null"
}
```

---

### Realtor — Profile

#### `POST /api/realtor/profile/update-base`

Updates the `full_name` and `phone` fields on the shared `profiles` table for a realtor.

**Source:** `app/api/realtor/profile/update-base/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `profiles` table |
| Tables written | `profiles` |

**Request body:**

```json
{
  "realtor_id": "uuid",
  "full_name": "Jane Smith",
  "phone": "555-123-4567"
}
```

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "full_name": "Jane Smith", "phone": "555-123-4567", ... } }
```

---

#### `POST /api/realtor/profile/update-realtor`

Upserts the realtor-specific profile record in `realtor_profile` (license, brokerage, coverage areas, etc.).

**Source:** `app/api/realtor/profile/update-realtor/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `realtor_profile` table |
| Tables written | `realtor_profile` |

**Request body:**

```json
{
  "realtor_id": "uuid",
  "bio": "10 years in residential real estate",
  "website": "https://example.com",
  "license_number": "RE123456",
  "license_states": ["TX", "FL"],
  "license_expiration": "2027-01-01",
  "brokerage_name": "Keller Williams",
  "brokerage_address": "123 Main St, Austin TX",
  "coverage_cities": ["Austin", "Round Rock"],
  "coverage_counties": ["Travis"],
  "coverage_zips": ["78701"],
  "price_bands": ["200k-400k", "400k-600k"],
  "property_types": ["single_family", "condo"],
  "new_lead_alerts": true
}
```

All fields except `realtor_id` are optional.

**Success response:**

```json
{ "success": true, "data": { "realtor_id": "uuid", ... } }
```

---

### Realtor — Leads

#### `POST /api/realtor/leads/update-stage`

Moves a lead to a new Kanban stage.

**Source:** `app/api/realtor/leads/update-stage/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `leads` table |
| Tables written | `leads` |

**Request body:**

```json
{
  "leadId": "uuid",
  "stage": "working"
}
```

Valid `stage` values: `new` | `working` | `nurture` | `client` | `lost`

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "stage": "working", ... } }
```

---

#### `POST /api/realtor/leads/set-next-touch`

Sets the next scheduled follow-up date/time for a lead.

**Source:** `app/api/realtor/leads/set-next-touch/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `leads` table |
| Tables written | `leads` |

**Request body:**

```json
{
  "leadId": "uuid",
  "nextTouchAt": "2026-06-01T14:00:00Z"
}
```

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "next_touch_at": "2026-06-01T14:00:00Z", ... } }
```

---

#### `POST /api/realtor/leads/decline`

Marks a lead as declined by the realtor with an optional reason.

**Source:** `app/api/realtor/leads/decline/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `leads` table |
| Tables written | `leads` |

**Request body:**

```json
{
  "leadId": "uuid",
  "reason": "Outside my coverage area"
}
```

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "declined_by_realtor": true, "decline_reason": "...", ... } }
```

---

#### `POST /api/realtor/leads/convert-to-client`

Promotes a lead to a CRM client. Creates a record in `crm_clients` and updates the lead's `stage` to `"client"`.

**Source:** `app/api/realtor/leads/convert-to-client/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Explicit session check — returns `401` if no session |
| Tables read | `leads` |
| Tables written | `crm_clients`, `leads` |

**Request body:**

```json
{
  "leadId": "uuid"
}
```

**Success response:**

```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "realtor_id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "555-000-0000",
    "role": "buyer",
    "status": "new"
  }
}
```

---

### Realtor — Appointments

#### `POST /api/realtor/appointments/create`

Creates a new appointment record.

**Source:** `app/api/realtor/appointments/create/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `appointments` table |
| Tables written | `appointments` |

**Request body:**

```json
{
  "realtor_id": "uuid",
  "title": "Buyer Consultation",
  "start_at": "2026-06-10T10:00:00Z",
  "end_at": "2026-06-10T11:00:00Z",
  "notes": "First meeting with client"
}
```

`notes` is optional. `status` defaults to `"scheduled"`.

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "title": "Buyer Consultation", "status": "scheduled", ... } }
```

---

### Realtor — CRM Clients

#### `POST /api/realtor/clients/create`

Creates a new CRM client record directly (not via lead conversion).

**Source:** `app/api/realtor/clients/create/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `crm_clients` table |
| Tables written | `crm_clients` |

**Request body:**

```json
{
  "realtor_id": "uuid",
  "full_name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "555-111-2222",
  "role": "buyer",
  "timeline": "3-6 months",
  "status": "new"
}
```

All fields except `realtor_id` and `full_name` are optional. `status` defaults to `"new"`.

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "full_name": "Alice Johnson", ... } }
```

---

### Realtor — Deals

#### `POST /api/realtor/deals/create`

Creates a new deal record in the deals pipeline.

**Source:** `app/api/realtor/deals/create/route.ts`

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth required | Via RLS on `deals` table |
| Tables written | `deals` |

**Request body:**

```json
{
  "realtor_id": "uuid",
  "property_address": "456 Oak Ave, Austin TX 78702",
  "mls_link": "https://mls.example.com/listing/12345",
  "offer_price": 375000,
  "side": "buyer",
  "stage": "under_contract"
}
```

All fields except `realtor_id` are optional. `stage` defaults to `"lead"`.

Valid `stage` values: `lead` | `showing` | `offer` | `under_contract` | `closed` | `dead`

**Success response:**

```json
{ "success": true, "data": { "id": "uuid", "property_address": "...", "stage": "under_contract", ... } }
```

---

## Server Actions

Server Actions are Next.js `'use server'` functions called directly from Server Components and forms. They do not have HTTP endpoints—they are invoked via React's action mechanism and are not callable via `fetch`.

### Admin Actions

**Source:** `app/admin/_actions.ts`

All admin actions use `supabase.rpc(...)` or direct table mutations. They call `revalidatePath()` after mutations to refresh cached pages. Email notifications (via Resend) are fired asynchronously and do not block the action response.

| Action | Parameters | Effect |
|--------|------------|--------|
| `assignClientToRealtor(clientId, realtorId, reason?)` | Client UUID, realtor UUID, optional reason string | Calls `assign_client_to_realtor` RPC; creates assignment, syncs lead, sends email notifications (match to client, new lead to realtor) |
| `unassignClient(clientId, reason)` | Client UUID, reason string | Removes active assignment; sends reassignment notifications |
| `updateClientStatus(clientId, status)` | Client UUID, status string | Updates `clients.status` field |
| `updateClient(clientId, data)` | Client UUID, partial client fields | Updates client record |
| `createClient(data)` | Client fields object | Inserts new client record |
| `updateRealtorCapacity(realtorId, capacity)` | Realtor UUID, integer | Updates `realtors.max_capacity` |
| `toggleRealtorActive(realtorId, active)` | Realtor UUID, boolean | Sets `realtors.is_active` |
| `updateRealtor(realtorId, data)` | Realtor UUID, partial realtor fields | Updates realtor record |
| `createRealtor(data)` | Realtor fields object | Inserts new realtor record |
| `addClientNote(clientId, content)` | Client UUID, note text | Inserts into `client_notes` |

---

### Quiz Actions

**Source:** `app/quiz/_actions.ts`

| Action | Parameters | Effect |
|--------|------------|--------|
| `startQuizSession(purpose, categories)` | Purpose string (`"buy"` / `"sell"` / `"both"`), categories array | Calls `start_quiz_session` RPC; creates a `quiz_sessions` row for the current user |
| `upsertQuizResponse(sessionId, questionId, value)` | Session UUID, question UUID, answer value | Upserts into `quiz_responses`; called on every answer (debounced 400ms client-side) |
| `completeQuizSession(sessionId)` | Session UUID | Marks session `status = 'completed'`; triggers client dashboard update |
| `getCurrentSession()` | — | Returns the current user's active or latest quiz session |
| `getSessionResponses(sessionId)` | Session UUID | Returns all `quiz_responses` for a session |

---

## Client-side Supabase Auth

Auth flows call `@supabase/supabase-js` directly from client components using the browser Supabase client (`lib/supabaseClient.ts`). These are not REST routes in the app.

| Flow | Page | Supabase method |
|------|------|-----------------|
| Sign up | `/signup` | `supabase.auth.signUp({ email, password })` |
| OTP verification | `/verify-otp` | `supabase.auth.verifyOtp({ email, token, type: 'signup' })` |
| Login | `/login` | `supabase.auth.signInWithPassword({ email, password })` |
| Forgot password | `/forgot-password` | `supabase.auth.resetPasswordForEmail(email, { redirectTo })` |
| Reset password | `/reset-password` | `supabase.auth.updateUser({ password })` |
| Sign out | Any page (nav) | `POST /api/auth/signout` route handler (server-side) |

After sign-up, Supabase triggers a database function (`handle_new_user`) that automatically inserts a row into the `profiles` table with `role = 'client'`. See [DATABASE.md](../DATABASE.md) for the trigger definition.

---

## Error shape

All route handlers return a consistent error structure on failure:

```json
{ "error": "Human-readable failure message" }
```

HTTP status codes used:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `302` | Redirect (signout only) |
| `401` | Unauthorized (explicit session check failed) |
| `500` | Server error (Supabase query failure, unexpected exception) |

There is currently no `422` (validation error) shape — invalid input typically surfaces as a `500` from the database layer.

---

## Database schema reference

See [../DATABASE.md](../DATABASE.md) for full table definitions, RLS policies, and migration order.
