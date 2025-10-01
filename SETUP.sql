-- ==========================================
-- ALIGN - DATABASE SETUP SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor
-- (Project → SQL Editor → New Query)
-- ==========================================

-- 1) Create user role enum type
CREATE TYPE user_role AS ENUM ('client','realtor','admin');

-- 2) Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Create function to automatically update timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- 4) Create trigger to update timestamp on profile changes
DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    'client'
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Create trigger to auto-create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7) Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8) Create RLS policy: users can read their own profile
DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
CREATE POLICY "read_own_profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- 9) Create RLS policy: users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 10) Create RLS policy: no direct inserts (only via trigger)
DROP POLICY IF EXISTS "no_direct_insert" ON public.profiles;
CREATE POLICY "no_direct_insert" ON public.profiles
FOR INSERT WITH CHECK (false);

-- ==========================================
-- ✅ SETUP COMPLETE!
-- ==========================================
-- Your profiles table is ready with:
-- - Automatic profile creation on signup
-- - Row-level security enabled
-- - Auto-updating timestamps
-- - Three role types: client, realtor, admin
-- ==========================================

-- Optional: Create an admin user manually
-- (Replace the UUID with an actual user ID from auth.users after signup)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'user-uuid-here';

