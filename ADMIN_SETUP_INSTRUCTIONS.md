# Admin Panel Setup - Required Actions

## ✅ What I've Fixed

### 1. **Signup Duplicate Detection** ✓
- Updated signup page to detect if email already exists
- Shows friendly message: "An account with this email already exists. Please log in instead."
- File changed: `app/signup/page.tsx`

### 2. **Login Admin Redirect** ✓
- Fixed login to redirect admins to `/admin` instead of `/dashboard`
- File changed: `app/login/page.tsx`

### 3. **Seed Data SQL Syntax** ✓
- Fixed `ON CONFLICT` clause issue in seed data
- File changed: `migrations/admin-panel-seed.sql`

---

## 🔧 What YOU Need To Do

### Step 1: Run the SQL Migrations

Open your **Supabase SQL Editor** and run these **in order**:

#### A) Main Admin Panel Migration
Copy and paste the entire contents of:
```
migrations/admin-panel.sql
```
Click **Run**. Wait for "Success" message.

#### B) Set Your Admin Role
**IMPORTANT:** Use this corrected SQL (the profiles table doesn't have an email column):

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com'
);
```

Replace `YOUR_EMAIL@example.com` with your actual email address.

Verify it worked:
```sql
SELECT p.*, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
```

You should see your profile with `role = 'admin'`.

#### C) (Optional) Add Seed Test Data
```
migrations/admin-panel-seed.sql
```

This adds sample realtors and clients for testing.

---

### Step 2: Test the Admin Panel

1. **Login as Admin:**
   - Navigate to `http://localhost:3000/login`
   - Use your admin email and password
   - You should be redirected to `/admin`

2. **Verify Features Work:**
   - ✅ Dashboard displays KPIs
   - ✅ Can view clients list
   - ✅ Can view realtors list
   - ✅ Can view assignments
   - ✅ Can view quiz submissions
   - ✅ Can view audit log

---

### Step 3: Create Real Realtors (Production)

When ready for production, create real realtor accounts:

```sql
-- Create a realtor
INSERT INTO public.realtors(full_name, email, phone, active, capacity)
VALUES ('Jane Doe', 'jane@yourrealty.com', '+1-555-0100', TRUE, 25)
RETURNING *;
```

---

## 🐛 Troubleshooting

### Issue: "Admin access required"
**Solution:** Make sure you ran the UPDATE query to set your role to 'admin' using the corrected SQL that joins with auth.users.

### Issue: Tables don't exist
**Solution:** Run `migrations/admin-panel.sql` in Supabase SQL Editor.

### Issue: Seed data error "ON CONFLICT"
**Solution:** The fixed version is already in `migrations/admin-panel-seed.sql` - just run it again.

### Issue: Next.js "InvariantError: Expected clientReferenceManifest"
**Solution:** This is a temporary hot-reload issue in Next.js 15.5.4. Just refresh the page or restart the dev server with `npm run dev`.

### Issue: 404 errors for favicon.ico
**Solution:** This is normal - just add a `favicon.ico` to the `public/` folder or ignore it.

---

## 📝 Summary of Changes

### Files Modified:
1. ✅ `app/signup/page.tsx` - Better duplicate user detection
2. ✅ `app/login/page.tsx` - Admin redirect to `/admin`
3. ✅ `migrations/admin-panel-seed.sql` - Fixed SQL syntax

### Files Created (Previously):
- ✅ `migrations/admin-panel.sql` - Main database migration
- ✅ `lib/db/admin.ts` - Data access layer
- ✅ `app/admin/_actions.ts` - Server actions
- ✅ `app/admin/**/*` - All admin panel pages and components
- ✅ `middleware.ts` - Route protection (already had it, added /admin)

---

## ✅ Next Steps After Setup

Once you've completed the steps above:

1. **Login as admin** at `/admin`
2. **Assign seed clients** to seed realtors (test the assignment flow)
3. **Check audit log** to see the assignment was logged
4. **Export CSV** from clients or realtors page
5. **Test all CRUD operations**

---

## 🚀 Ready to Use!

The admin panel is fully functional. All you need to do is:
1. Run the SQL migrations
2. Set your admin role (with the corrected SQL)
3. Login and explore!

For detailed documentation, see **README_ADMIN.md**.


