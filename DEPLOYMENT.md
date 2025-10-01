# Deployment Guide - Align Auth MVP

This guide covers deploying your Align authentication app to production.

## 🚀 Deploying to Vercel (Recommended)

Vercel is built by the creators of Next.js and provides the best developer experience.

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Your code pushed to a GitHub repository

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Auth MVP"
git branch -M main
git remote add origin https://github.com/yourusername/align-beta.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `align-beta` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

Before clicking "Deploy", add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Deploy

Click **"Deploy"** and wait ~2 minutes.

You'll get a URL like: `https://align-beta-xxxxx.vercel.app`

### Step 5: Update Supabase URLs

1. Copy your Vercel deployment URL
2. Go to your Supabase project
3. Navigate to **Authentication → URL Configuration**
4. Add to **Redirect URLs**:
   ```
   https://align-beta-xxxxx.vercel.app/*
   https://*.vercel.app/*
   ```
5. Click **Save**

### Step 6: Set Up Custom Domain (Optional)

1. In Vercel, go to your project → **Settings → Domains**
2. Add your custom domain: `app.alignagentsre.com`
3. Follow Vercel's instructions to configure DNS
4. Once verified, update Supabase:
   - Set **Site URL** to: `https://app.alignagentsre.com`
   - Add to **Redirect URLs**: `https://app.alignagentsre.com/*`

## 🔐 Production Security Checklist

Before going live, verify:

- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Supabase RLS policies are enabled on `profiles` table
- [ ] Email confirmation is required for signups
- [ ] Strong password requirements are enforced (6+ characters minimum)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Environment variables are set in Vercel dashboard
- [ ] Custom domain has SSL certificate (automatic with Vercel)
- [ ] Supabase redirect URLs include production domain
- [ ] Email templates look professional and branded

## 📧 Email Configuration

### Using a Custom Email Domain (Recommended for Production)

By default, Supabase sends emails from `noreply@mail.app.supabase.io`. For a professional look:

1. Go to **Project Settings → Auth**
2. Click **"SMTP Settings"**
3. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)
4. Test email delivery

Popular options:
- **SendGrid**: 100 emails/day free
- **AWS SES**: $0.10 per 1000 emails
- **Mailgun**: 5000 emails/month free

### Update Email Templates

Make sure your email templates are branded:

1. Go to **Authentication → Email Templates**
2. Update each template (Confirm signup, Reset password, etc.)
3. Add your logo, brand colors, and professional copy
4. Test all email types

## 🧪 Testing in Production

After deployment, test the entire flow:

### Test Checklist

- [ ] Visit production URL
- [ ] Home page loads correctly
- [ ] Sign up with a new email
- [ ] Receive verification email (check spam)
- [ ] Verify OTP code
- [ ] Land on dashboard with correct role
- [ ] Log out
- [ ] Log back in
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Reset password successfully
- [ ] Log in with new password
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Safari, Firefox)

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics to track:
- Page views
- Performance metrics
- User engagement

1. Go to your project in Vercel
2. Click **Analytics** tab
3. Enable Web Analytics

### Supabase Monitoring

Monitor your database:
1. **Database → Logs**: Query performance
2. **Authentication → Logs**: Auth events and errors
3. **Authentication → Users**: User growth

### Error Tracking (Optional)

Consider adding:
- **Sentry**: Real-time error tracking
- **LogRocket**: Session replay
- **PostHog**: Product analytics

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update: description"
git push

# Vercel automatically deploys! 🎉
```

### Preview Deployments

Every pull request gets a preview URL:
1. Create a branch: `git checkout -b feature/new-feature`
2. Make changes and push
3. Create PR on GitHub
4. Vercel comments with preview URL

## 🌍 Environment-Specific Configuration

### Production vs Development

Use different Supabase projects for each environment:

**Development** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-key
```

**Production** (Vercel env vars):
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

Benefits:
- Separate user databases
- Test without affecting production
- Different email configurations

## 📈 Scaling Considerations

The current setup scales well, but consider:

### Database
- **Free tier**: 500MB storage, unlimited requests
- **Pro tier** ($25/mo): 8GB storage, daily backups
- Monitor usage in Supabase dashboard

### Vercel
- **Hobby tier**: Free, 100GB bandwidth/month
- **Pro tier** ($20/mo): 1TB bandwidth, team features
- Monitor usage in Vercel dashboard

### When to Upgrade
- Free tiers are fine for MVP and early users
- Upgrade when you hit:
  - 100+ active users
  - 10,000+ page views/month
  - Need advanced features (team collaboration, etc.)

## 🆘 Rollback Plan

If something goes wrong:

### Quick Rollback in Vercel
1. Go to **Deployments** tab
2. Find the last working deployment
3. Click **···** → **Promote to Production**

### Database Rollback
1. Supabase Pro has point-in-time recovery
2. Free tier: manually restore from SQL backup
3. Always test database migrations in development first

## 🎯 Go-Live Checklist

Before announcing to users:

- [ ] All features tested in production
- [ ] Custom domain configured with SSL
- [ ] Email templates are professional and branded
- [ ] Error tracking is set up
- [ ] Analytics are configured
- [ ] Monitoring dashboards are accessible
- [ ] Backup strategy is in place
- [ ] Team has access to Vercel and Supabase
- [ ] Documentation is up to date
- [ ] Legal pages added (Privacy Policy, Terms of Service)
- [ ] Support email/contact form is ready

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

🎉 Congratulations on deploying your app!

