# Align Admin Panel Documentation

## Overview

The Admin Panel provides a comprehensive CRM system for managing clients, realtors, assignments, and quiz submissions. It features role-based access control, audit logging, and powerful bulk operations.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Features](#features)
3. [Database Setup](#database-setup)
4. [User Roles](#user-roles)
5. [Pages & Functionality](#pages--functionality)
6. [Assignment Workflow](#assignment-workflow)
7. [API & Server Actions](#api--server-actions)
8. [Security](#security)
9. [Extending the System](#extending-the-system)

---

## Getting Started

### Prerequisites

- Supabase project set up
- Node.js and Next.js installed
- Admin access to your Supabase SQL editor

### Installation Steps

1. **Run the SQL Migration**

   Execute the migration file in your Supabase SQL editor:
   ```bash
   migrations/admin-panel.sql
   ```

2. **Set Your Admin Role**

   In Supabase SQL editor, set your user to admin:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

3. **(Optional) Seed Test Data**

   For development/testing, run:
   ```bash
   migrations/admin-panel-seed.sql
   ```

4. **Access the Admin Panel**

   Navigate to `/admin` in your browser. You'll be redirected to login if not authenticated.

---

## Features

### Core Capabilities

✅ **Client Management**
- View all clients with filtering and search
- Detailed client profiles with quiz submissions
- Assignment history tracking
- Status management (new, qualified, contacted, assigned, active, closed, lost)
- Notes and tags

✅ **Realtor Management**
- Track realtor capacity and utilization
- MSA (Master Service Agreement) status tracking
- Active/inactive status toggle
- Capacity adjustment with audit trail
- View assigned clients per realtor

✅ **Assignment System**
- Assign/unassign clients to realtors
- Bulk assignment operations
- Load balancing recommendations
- Assignment history with reasons
- Automatic status updates

✅ **Quiz Submissions**
- Browse all quiz submissions
- Detailed answer viewer for each submission
- Link submissions to clients
- CSV export functionality
- Support for all question types (text, choice, address, etc.)

✅ **Audit Log**
- Track all administrative actions
- Filter by action type, entity, and actor
- Immutable audit trail
- Detailed metadata for each action

✅ **Dashboard KPIs**
- Total clients and unassigned clients
- Active realtors and capacity utilization
- New quiz submissions (last 7 days)
- Work queues (unassigned clients, recent submissions)

---

## Database Setup

### Core Tables

1. **`clients`** - Client records
   - `id`, `user_id`, `full_name`, `email`, `phone`
   - `status`, `source`, `tags`, `notes`
   - Timestamps: `created_at`, `updated_at`

2. **`realtors`** - Realtor profiles
   - `id`, `user_id`, `full_name`, `email`, `phone`
   - `capacity`, `active`, `msa_signed_at`
   - Timestamps: `created_at`, `updated_at`

3. **`client_realtor_assignments`** - Assignment history
   - `id`, `client_id`, `realtor_id`, `assigned_by`
   - `assigned_at`, `unassigned_at`, `reason`
   - Unique constraint: one active assignment per client

4. **`audit_logs`** - Audit trail
   - `id`, `actor_user_id`, `action`, `entity`
   - `entity_id`, `meta` (JSONB), `created_at`

5. **`client_notes`** - Client notes
   - `id`, `client_id`, `author_id`, `content`
   - Timestamps: `created_at`, `updated_at`

### Views

- **`v_current_assignments`** - Active assignments only

### Helper Functions

- `is_admin()` - Check if current user is admin
- `is_realtor()` - Check if current user is realtor
- `is_client()` - Check if current user is client
- `require_admin()` - Throw error if not admin

### Admin RPCs

- `assign_client_to_realtor(client_id, realtor_id, reason?)` - Assign client
- `unassign_client(client_id, reason)` - Unassign client
- `update_client_status(client_id, status)` - Update status with audit
- `update_realtor_capacity(realtor_id, capacity)` - Update capacity with audit
- `toggle_realtor_active(realtor_id, active)` - Toggle active status

---

## User Roles

### Admin (`admin`)
- Full access to all admin panel features
- Can view and manage all clients, realtors, and assignments
- Can view audit logs
- Protected by RLS policies and middleware

### Realtor (`realtor`)
- Access to `/realtor` dashboard (separate from admin)
- Can view only assigned clients
- Can see quiz submissions for assigned clients
- Read-only access to client data

### Client (`client`)
- Access to quiz and dashboard
- Can view own profile and quiz submissions
- Cannot access admin or realtor areas

---

## Pages & Functionality

### Dashboard (`/admin`)

**Purpose:** High-level overview and quick actions

**Features:**
- 4 KPI cards (total clients, unassigned, active realtors, capacity utilization)
- Unassigned clients queue (quick assign)
- Recent quiz submissions feed
- Quick action cards

**Use Cases:**
- Daily operational overview
- Identify unassigned clients needing attention
- Monitor new quiz submissions

---

### Clients (`/admin/clients`)

**Purpose:** Manage all clients in the system

**Features:**
- Searchable, filterable table
- Status breakdown stats
- Assign button on each row
- CSV export
- Add new client

**Filters:**
- Search by name, email, phone
- Filter by status

**Actions:**
- View client detail
- Assign to realtor
- Export to CSV

---

### Client Detail (`/admin/clients/[id]`)

**Purpose:** Comprehensive client profile

**Features:**
- Basic info (email, phone, created date, status, source, tags)
- Quiz submissions list (links to submission detail)
- Assignment history (past and current)
- Assign/reassign/unassign actions
- Notes

**Use Cases:**
- Review client background before assignment
- Check quiz responses
- Track assignment history

---

### Realtors (`/admin/realtors`)

**Purpose:** Manage realtor profiles and capacity

**Features:**
- Table with capacity tracking
- Utilization indicators (color-coded)
- Active/inactive filtering
- MSA status column
- CSV export

**Columns:**
- Name, email, phone
- Active status
- Capacity, assigned count, utilization %
- MSA signed status

---

### Realtor Detail (`/admin/realtors/[id]`)

**Purpose:** Detailed realtor profile and assignments

**Features:**
- Basic info (email, phone, joined date, MSA status)
- Stats card (status, capacity, assigned count, utilization with progress bar)
- List of assigned clients (links to client detail)
- Edit capacity action
- Toggle active/inactive

**Use Cases:**
- Adjust realtor capacity
- Review assigned clients
- Deactivate realtor temporarily

---

### Assignments (`/admin/assignments`)

**Purpose:** Bulk assignment operations and load balancing

**Features:**
- Realtor capacity overview (sorted by available capacity)
- Color-coded utilization bars
- Unassigned clients list with bulk select
- Recommended realtor suggestion
- Current assignments table

**Workflow:**
1. View realtor load
2. Select unassigned clients (checkbox)
3. Choose realtor (or use recommended)
4. Bulk assign

**Use Cases:**
- Balance load across realtors
- Quickly assign multiple new clients
- Identify over/under-utilized realtors

---

### Quizzes (`/admin/quizzes`)

**Purpose:** Browse and review quiz submissions

**Features:**
- Table of all quiz submissions
- Filter by status (completed, in progress)
- Link to client profile
- CSV export
- Stats (total, completed, in progress)

---

### Quiz Detail (`/admin/quizzes/[sessionId]`)

**Purpose:** View detailed quiz responses

**Features:**
- Session info (user, purpose, status, timestamps, categories)
- All responses with questions and answers
- Question type indicators
- CSV export for this submission
- Pretty formatting for different answer types:
  - Text (short/long)
  - Multiple choice
  - Yes/No
  - Address (formatted)
  - JSON for complex types

**Use Cases:**
- Review client needs before assignment
- Export for external processing
- Quality check quiz responses

---

### Audit Log (`/admin/audit`)

**Purpose:** Track all administrative actions

**Features:**
- Chronological log of all actions
- Filter by action type, entity, actor
- Metadata display for each action
- Stats (total events, assignments, status changes, capacity updates)

**Logged Actions:**
- `ASSIGN_CLIENT` - Client assigned to realtor
- `UNASSIGN_CLIENT` - Client unassigned
- `UPDATE_CLIENT_STATUS` - Status changed
- `UPDATE_REALTOR_CAPACITY` - Capacity changed
- `TOGGLE_REALTOR_ACTIVE` - Active status toggled

**Metadata Example:**
```json
{
  "realtor_id": "uuid",
  "reason": "Initial assignment",
  "old_status": "new",
  "new_status": "assigned"
}
```

---

### Settings (`/admin/settings`)

**Purpose:** Configure admin preferences

**Features:**
- Notification preferences (placeholder)
- Assignment rules (placeholder)
- Display options
- System information

*Note: Settings are currently UI-only. Backend implementation is a future enhancement.*

---

## Assignment Workflow

### Standard Assignment

1. Navigate to **Clients** or **Dashboard**
2. Click **Assign** button on client row
3. Select realtor from dropdown (shows only active realtors)
4. Optionally add reason
5. Click **Assign**
6. System automatically:
   - Closes any existing assignment
   - Creates new assignment
   - Updates client status to "assigned"
   - Logs to audit trail

### Bulk Assignment

1. Navigate to **Assignments**
2. Review realtor capacity overview
3. Select clients from "Unassigned Clients" list
4. Choose realtor (system recommends realtor with most capacity)
5. Click **Assign (N)**
6. System assigns all selected clients sequentially

### Unassignment

1. Navigate to client detail
2. Click **Unassign**
3. Provide reason (required)
4. Confirm
5. System:
   - Marks assignment as `unassigned_at = now()`
   - Updates client status to "qualified"
   - Logs to audit trail

### Reassignment

1. Client already assigned to Realtor A
2. Click **Reassign** on client detail
3. Select new Realtor B
4. System:
   - Unassigns from Realtor A (reason: "reassigned")
   - Assigns to Realtor B
   - Logs both actions

---

## API & Server Actions

All server actions are defined in `app/admin/_actions.ts`. They use Supabase RPCs for secure, audited operations.

### Assignment Actions

```typescript
assignClientToRealtor(clientId: string, realtorId: string, reason?: string)
unassignClient(clientId: string, reason: string)
```

### Client Actions

```typescript
updateClientStatus(clientId: string, status: string)
updateClient(clientId: string, updates: { full_name?, email?, phone?, tags?, notes? })
createClient(data: { full_name, email, phone?, status?, source?, tags? })
```

### Realtor Actions

```typescript
updateRealtorCapacity(realtorId: string, capacity: number)
toggleRealtorActive(realtorId: string, active: boolean)
updateRealtor(realtorId: string, updates: { full_name?, email?, phone?, notes?, msa_signed_at? })
createRealtor(data: { full_name, email, phone?, capacity?, active? })
```

### Note Actions

```typescript
addClientNote(clientId: string, content: string)
```

---

## Security

### Middleware Protection

`middleware.ts` checks:
1. User is authenticated
2. User has `admin` role
3. Redirects non-admins to `/dashboard`

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Admin:**
- Full access to all tables (`admin_all_*` policies)

**Realtor:**
- Read only assigned clients
- Read quiz submissions for assigned clients
- Cannot modify

**Client:**
- Read own client record
- Read own quiz submissions

### Secure RPCs

All admin RPCs call `require_admin()` which throws an error if user is not admin. RLS is enforced at the database level.

### Audit Trail

All sensitive operations are logged to `audit_logs` with:
- Actor (user_id of admin)
- Action type
- Entity type and ID
- Metadata (before/after values, reason, etc.)
- Timestamp

Audit logs are **append-only** and **immutable**.

---

## Extending the System

### Adding a New Status

1. Update `updateClientStatus` to allow new status
2. Add color to `StatusBadge` component
3. Update filters in client table

### Adding a New Action

1. Create server action in `_actions.ts`
2. Call Supabase RPC (or direct query if simple)
3. Add audit log entry
4. Revalidate paths
5. Add UI button/form

### Adding a New KPI

1. Add query to `getDashboardStats()` in `lib/db/admin.ts`
2. Add `KPICard` to dashboard

### Custom Realtor Attributes

1. Add column to `realtors` table
2. Update `Realtor` type in `lib/db/admin.ts`
3. Add to detail page UI
4. Add edit action if needed

### Email Notifications

To add notifications when a client is assigned:

1. Install email provider (Resend, SendGrid, etc.)
2. In `assign_client_to_realtor` RPC, add notification trigger
3. Or use Supabase triggers/functions to send email on insert

Example hook:
```sql
CREATE OR REPLACE FUNCTION notify_realtor_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Call your email service here
  -- Or insert into a notification queue
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_assignment_notify
AFTER INSERT ON client_realtor_assignments
FOR EACH ROW EXECUTE FUNCTION notify_realtor_on_assignment();
```

---

## Troubleshooting

### "Admin access required" error

**Cause:** User's `profiles.role` is not `'admin'`

**Fix:**
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Clients not showing in realtor dashboard

**Cause:** Realtor dashboard uses `crm_clients` table, admin uses `clients` table

**Solution:** These are separate systems. If you want to unify them, modify the schema to use a single clients table or create a sync mechanism.

### Assignment fails with "Not allowed"

**Cause:** RPC checks if user is admin and if session is valid

**Fix:** Ensure:
1. User is logged in
2. User has admin role
3. Client and realtor IDs are valid UUIDs

### Capacity utilization shows 0%

**Cause:** No active realtors or no assignments

**Fix:** 
1. Ensure realtors are marked `active = true`
2. Assign some clients to see utilization

---

## Best Practices

1. **Always provide reasons for unassignments** - Helps with audit trail and understanding patterns

2. **Review quiz submissions before assignment** - Ensure realtor is a good match for client needs

3. **Monitor capacity utilization** - Keep below 90% to maintain quality

4. **Regularly review audit log** - Spot issues early

5. **Use bulk assignment for efficiency** - Especially for batches of new clients

6. **Export data regularly** - For reporting and backup

7. **Tag clients appropriately** - Makes filtering and analysis easier

8. **Update client status as they progress** - Keeps pipeline accurate

---

## Support & Maintenance

### Backup Strategy

- Supabase handles automated backups
- Export critical data (clients, assignments) weekly via CSV

### Monitoring

- Check dashboard daily for unassigned clients
- Review capacity utilization weekly
- Audit log review monthly

### Updates

To update the admin panel:
1. Pull latest code
2. Run any new migrations
3. Test in staging environment
4. Deploy to production

---

## License

Proprietary - Align Platform

---

## Contact

For questions or issues with the admin panel:
- Technical Issues: Check audit log and database logs
- Feature Requests: File in project backlog
- Security Concerns: Report immediately to security team

---

**Last Updated:** October 2025
**Version:** 1.0.0

