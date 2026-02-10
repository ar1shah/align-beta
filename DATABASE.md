# Align - Database Schema Reference

This document describes the complete database schema for Align, hosted on Supabase (PostgreSQL).

---

## Quick Reference

| Migration File | Purpose | Tables Created |
|----------------|---------|----------------|
| `SETUP.sql` | Core auth/profiles | `profiles` |
| `seed/quiz.sql` | Quiz system | `quiz_sections`, `quiz_questions`, `quiz_options`, `quiz_sessions`, `quiz_responses` |
| `migrations/admin-panel.sql` | Admin panel | `clients`, `realtors`, `client_realtor_assignments`, `audit_logs`, `client_notes` |
| (In app code) | Realtor dashboard | `leads`, `appointments`, `deals`, `crm_clients`, `referral_contracts`, `payouts`, `realtor_profile` |

---

## Core Tables

### `profiles`
User profiles linked to Supabase Auth. Created automatically on signup via trigger.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',  -- 'client', 'realtor', 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Enums:**
```sql
CREATE TYPE user_role AS ENUM ('client', 'realtor', 'admin');
```

**Triggers:**
- `on_auth_user_created` → Auto-creates profile when user signs up
- `trigger_set_updated_at` → Updates `updated_at` on changes

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- No direct inserts (only via trigger)

---

## Quiz Tables

### `quiz_sections`
Top-level quiz sections (e.g., "Entry", "Sell Details", "Buy Details").

```sql
CREATE TABLE quiz_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,           -- e.g., 'entry', 'sell_details'
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  visible_if JSONB,                   -- Conditional visibility rules
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `quiz_questions`
Questions within sections.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES quiz_sections(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,           -- e.g., 'purpose', 'budget_range'
  prompt TEXT NOT NULL,               -- Question text
  type question_type NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  help_text TEXT,
  ui_props JSONB,                     -- UI configuration
  visible_if JSONB,                   -- Conditional visibility
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Question Types Enum:**
```sql
CREATE TYPE question_type AS ENUM (
  'single_choice', 'multi_choice', 'short_text', 'long_text',
  'number', 'money', 'address', 'yes_no', 'phone', 'email', 'date'
);
```

### `quiz_options`
Options for choice-based questions.

```sql
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  tags JSONB,                         -- For matching algorithm
  weight INT,                         -- Scoring weight
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `quiz_sessions`
User quiz sessions (tracks progress).

```sql
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',  -- 'in_progress', 'completed'
  purpose TEXT,                       -- 'buy', 'sell', 'both'
  selected_categories TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `quiz_sessions_user_idx` on `user_id`

### `quiz_responses`
Individual question responses.

```sql
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  value JSONB NOT NULL,               -- Response value (flexible format)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `quiz_responses_unique` on `(session_id, question_id)` - One response per question
- `quiz_responses_user_idx` on `user_id`

**RLS Policies:**
- Quiz structure (sections, questions, options): Public read
- Sessions: Users can read/insert/update their own
- Responses: Users can read/insert/update their own
- Admins can read all sessions and responses

**RPC Functions:**
```sql
-- Start a new quiz session
start_quiz_session(purpose_in TEXT, cats_in TEXT[]) RETURNS quiz_sessions

-- Save/update a response
upsert_quiz_response(session_in UUID, question_in UUID, value_in JSONB) RETURNS quiz_responses
```

---

## Admin Panel Tables

### `clients`
Client records managed by admins (separate from realtor's CRM clients).

```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',          -- new, qualified, contacted, assigned, active, closed, lost
  source TEXT DEFAULT 'quiz',         -- quiz, referral, import, manual
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_clients_status` on `status`
- `idx_clients_user_id` on `user_id`
- `idx_clients_email` on `email`
- `idx_clients_created` on `created_at DESC`

### `realtors`
Realtor profiles for admin management.

```sql
CREATE TABLE public.realtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  msa_signed_at TIMESTAMPTZ,
  capacity INTEGER DEFAULT 20,        -- Max clients they can handle
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_realtors_active` on `active`
- `idx_realtors_user_id` on `user_id`

### `client_realtor_assignments`
Assignment history (who is assigned to whom).

```sql
CREATE TABLE public.client_realtor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  realtor_id UUID REFERENCES public.realtors(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ,          -- NULL = active assignment
  reason TEXT
);
```

**Constraints:**
- `uniq_client_active_assignment` - Only one active assignment per client

**Indexes:**
- `idx_cra_realtor_active` on `realtor_id` where `unassigned_at IS NULL`
- `idx_cra_client` on `client_id`
- `idx_cra_realtor` on `realtor_id`
- `idx_cra_assigned_at` on `assigned_at DESC`

### `audit_logs`
Immutable audit trail for admin actions.

```sql
CREATE TABLE public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,               -- ASSIGN_CLIENT, UNASSIGN_CLIENT, UPDATE_CLIENT_STATUS, etc.
  entity TEXT NOT NULL,               -- client, realtor, etc.
  entity_id UUID,
  meta JSONB,                         -- Additional context
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `idx_audit_created` on `created_at DESC`
- `idx_audit_actor` on `actor_user_id`
- `idx_audit_entity` on `(entity, entity_id)`
- `idx_audit_action` on `action`

### `client_notes`
Notes attached to clients.

```sql
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Views

```sql
-- Current active assignments
CREATE VIEW public.v_current_assignments AS
SELECT DISTINCT ON (a.client_id) a.*
FROM public.client_realtor_assignments a
WHERE a.unassigned_at IS NULL
ORDER BY a.client_id, a.assigned_at DESC;
```

### Admin RPC Functions

```sql
-- Assign a client to a realtor (closes any existing assignment)
assign_client_to_realtor(p_client_id UUID, p_realtor_id UUID, p_reason TEXT) RETURNS VOID

-- Unassign a client
unassign_client(p_client_id UUID, p_reason TEXT) RETURNS VOID

-- Update client status
update_client_status(p_client_id UUID, p_status TEXT) RETURNS VOID

-- Update realtor capacity
update_realtor_capacity(p_realtor_id UUID, p_capacity INTEGER) RETURNS VOID

-- Toggle realtor active status
toggle_realtor_active(p_realtor_id UUID, p_active BOOLEAN) RETURNS VOID
```

### Helper Functions

```sql
is_admin() RETURNS BOOLEAN      -- Check if current user is admin
is_realtor() RETURNS BOOLEAN    -- Check if current user is realtor
is_client() RETURNS BOOLEAN     -- Check if current user is client
require_admin() RETURNS VOID    -- Throws error if not admin
```

---

## Realtor Dashboard Tables

These tables are used by the realtor dashboard. Schema is defined in application code (TypeScript interfaces).

### `leads`
Leads assigned to realtors.

```sql
-- Inferred from lib/db/leads.ts
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_client_id UUID,
  assigned_realtor_id UUID,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  buyer_or_seller TEXT,              -- 'buyer' or 'seller'
  price_target NUMERIC,
  area_pref TEXT,
  lead_source TEXT,
  next_step TEXT,
  next_touch_at TIMESTAMPTZ,
  stage TEXT DEFAULT 'new',          -- 'new', 'working', 'nurture', 'lost', 'client'
  declined_by_realtor BOOLEAN DEFAULT false,
  decline_reason TEXT
);
```

### `appointments`
Realtor appointments.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  realtor_id UUID NOT NULL,
  lead_id UUID,
  client_id UUID,
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',   -- 'scheduled', 'confirmed', 'no_show', 'completed'
  notes TEXT
);
```

### `deals`
Deals in the realtor pipeline.

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  realtor_id UUID NOT NULL,
  lead_id UUID,
  client_id UUID,
  stage TEXT DEFAULT 'lead',         -- 'lead', 'client', 'under_contract', 'closed'
  property_address TEXT,
  mls_link TEXT,
  offer_price NUMERIC,
  close_date DATE,
  escrow_title_info TEXT,
  side TEXT,                         -- 'listing' or 'buy'
  cda_storage_path TEXT,             -- Document path
  hud_storage_path TEXT              -- Document path
);
```

### `crm_clients`
Realtor's personal CRM clients (different from admin `clients` table).

```sql
CREATE TABLE crm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  realtor_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,                         -- 'buyer' or 'seller'
  timeline TEXT,
  criteria JSONB,
  property_links TEXT[],
  status TEXT DEFAULT 'new'          -- 'new', 'active', 'under_contract', 'closed'
);
```

### `referral_contracts`
MSA and deal-specific contracts.

```sql
CREATE TABLE referral_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  realtor_id UUID NOT NULL,
  type TEXT NOT NULL,                -- 'msa' or 'deal'
  status TEXT DEFAULT 'pending_signature',  -- 'pending_signature', 'active', 'completed'
  fee_percent NUMERIC,
  territory TEXT,
  countersigned BOOLEAN DEFAULT false,
  linked_deal_id UUID,
  document_path TEXT
);
```

### `payouts`
Payout records for closed deals.

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  realtor_id UUID NOT NULL,
  deal_id UUID NOT NULL,
  fee_percent NUMERIC,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',     -- 'pending', 'processing', 'paid', 'on_hold'
  payment_ref TEXT,
  statement_path TEXT
);
```

### `realtor_profile`
Extended realtor profile information.

```sql
CREATE TABLE realtor_profile (
  realtor_id UUID PRIMARY KEY,
  photo_url TEXT,
  bio TEXT,
  website TEXT,
  license_number TEXT,
  license_states TEXT[],
  license_expiration DATE,
  brokerage_name TEXT,
  brokerage_address TEXT,
  coverage_cities TEXT[],
  coverage_counties TEXT[],
  coverage_zips TEXT[],
  price_bands TEXT[],
  property_types TEXT[],
  new_lead_alerts BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false
);
```

---

## Row Level Security (RLS) Summary

| Table | Admin | Realtor | Client |
|-------|-------|---------|--------|
| `profiles` | Full | Own only | Own only |
| `quiz_*` structure | Read | Read | Read |
| `quiz_sessions` | Full | Assigned clients | Own only |
| `quiz_responses` | Full | Assigned clients | Own only |
| `clients` | Full | Assigned only | Own only |
| `realtors` | Full | None | None |
| `assignments` | Full | Own assignments | None |
| `audit_logs` | Full | None | None |
| `client_notes` | Full | Assigned clients | None |

---

## Migration Order

Run these in order when setting up a new database:

1. **Core profiles** (`SETUP.sql`)
   ```sql
   -- Creates: user_role enum, profiles table, triggers, RLS policies
   ```

2. **Quiz system** (`seed/quiz.sql`)
   ```sql
   -- Creates: question_type enum, quiz_sections, quiz_questions, quiz_options, 
   --          quiz_sessions, quiz_responses, RLS policies, RPC functions
   ```

3. **Admin panel** (`migrations/admin-panel.sql`)
   ```sql
   -- Creates: Helper functions, clients, realtors, client_realtor_assignments,
   --          audit_logs, client_notes, v_current_assignments view, admin RPCs
   ```

4. **Seed quiz data** (run via script)
   ```bash
   npm run seed:quiz
   ```

5. **Set admin role**
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

6. **(Optional) Seed test data** (`migrations/admin-panel-seed.sql`)
   ```sql
   -- Creates: Sample realtors and clients for testing
   ```

---

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `documents` | Deal documents (CDA, HUD) | Private, realtor-only |

---

## Common Queries

### Get unassigned clients
```sql
SELECT c.* FROM clients c
LEFT JOIN v_current_assignments a ON a.client_id = c.id
WHERE a.id IS NULL;
```

### Get realtor capacity utilization
```sql
SELECT r.*, 
  COUNT(a.id) as assigned_count,
  COUNT(a.id)::float / r.capacity as utilization
FROM realtors r
LEFT JOIN client_realtor_assignments a ON a.realtor_id = r.id AND a.unassigned_at IS NULL
WHERE r.active = true
GROUP BY r.id;
```

### Get quiz completion rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*) as rate
FROM quiz_sessions;
```

---

*Last updated: January 2026*
