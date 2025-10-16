# Admin Panel - Quick Start Guide

## ⚡ 4 Steps to Get Started

### Step 1: Run SQL Migration
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `migrations/admin-panel.sql`
3. Click **Run**
4. Wait for "Success" message

### Step 2: Set Your Admin Role
In the same SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE@example.com';
```
(Replace with your actual email)

### Step 3: (Optional) Add Test Data
For testing, run:
```sql
-- Copy and paste contents of migrations/admin-panel-seed.sql
```

### Step 4: Access Admin Panel
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin`
3. You should see the admin dashboard!

---

## ✅ Verification Checklist

After completing the steps above, verify these work:

- [ ] Can access `/admin` without redirect
- [ ] Dashboard shows KPI cards
- [ ] Can view clients list at `/admin/clients`
- [ ] Can view realtors list at `/admin/realtors`
- [ ] Can click "Assign" on a client
- [ ] Can view quiz submissions at `/admin/quizzes`
- [ ] Can see audit log at `/admin/audit`

---

## 🎯 First Actions

Once installed, do these:

1. **Create Real Realtors:**
   ```sql
   INSERT INTO public.realtors(full_name, email, phone, active, capacity)
   VALUES ('Jane Doe', 'jane@example.com', '+1-555-0100', TRUE, 25)
   RETURNING *;
   ```

2. **Test Assignment Flow:**
   - Go to Dashboard → Click on an unassigned client
   - Click "Assign to Realtor"
   - Select a realtor → Click Assign
   - Check Audit Log to see the action

3. **Export Data:**
   - Go to Clients → Click "Export CSV"
   - Verify the download works

---

## 🚨 Troubleshooting

**Problem:** "Admin access required" error
- **Fix:** Make sure you ran the `UPDATE profiles SET role = 'admin'` SQL

**Problem:** Tables don't exist errors
- **Fix:** Run `migrations/admin-panel.sql` again

**Problem:** Can't see middleware protection working
- **Fix:** Log out, then try accessing `/admin` - should redirect to login

---

## 📚 Next Steps

- Read **README_ADMIN.md** for full documentation
- Read **ADMIN_IMPLEMENTATION_SUMMARY.md** for technical details
- Start assigning clients to realtors!

---

**That's it! You're ready to manage your CRM. 🎉**

