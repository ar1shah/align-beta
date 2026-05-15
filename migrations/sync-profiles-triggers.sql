-- ==========================================
-- ALIGN - PROFILE SYNC TRIGGERS
-- ==========================================


-- 1) FUNCTION: Sync profile to clients table
-- ==========================================
CREATE OR REPLACE FUNCTION public.sync_profile_to_client()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only sync if role is 'client'
  IF NEW.role = 'client' THEN
    -- Get email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- Insert or update client record
    INSERT INTO public.clients (user_id, full_name, email, phone, status, source)
    VALUES (
      NEW.id,
      NEW.full_name,
      user_email,
      NEW.phone,
      'new',
      'quiz'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) FUNCTION: Sync profile to realtors table
-- ==========================================
CREATE OR REPLACE FUNCTION public.sync_profile_to_realtor()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only sync if role is 'realtor'
  IF NEW.role = 'realtor' THEN
    -- Get email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- Insert or update realtor record
    INSERT INTO public.realtors (user_id, full_name, email, phone, active, capacity)
    VALUES (
      NEW.id,
      NEW.full_name,
      user_email,
      NEW.phone,
      TRUE,
      20
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) TRIGGER: Sync on profile insert
-- ==========================================
DROP TRIGGER IF EXISTS on_profile_sync_client ON public.profiles;
CREATE TRIGGER on_profile_sync_client
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_client();

DROP TRIGGER IF EXISTS on_profile_sync_realtor ON public.profiles;
CREATE TRIGGER on_profile_sync_realtor
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_realtor();

-- 4) TRIGGER: Sync on profile role update
-- ==========================================
DROP TRIGGER IF EXISTS on_profile_role_change_client ON public.profiles;
CREATE TRIGGER on_profile_role_change_client
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'client' AND (OLD.role IS DISTINCT FROM NEW.role))
EXECUTE FUNCTION public.sync_profile_to_client();

DROP TRIGGER IF EXISTS on_profile_role_change_realtor ON public.profiles;
CREATE TRIGGER on_profile_role_change_realtor
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'realtor' AND (OLD.role IS DISTINCT FROM NEW.role))
EXECUTE FUNCTION public.sync_profile_to_realtor();

-- 5) TRIGGER: Sync on profile info update (name, phone)
-- ==========================================
DROP TRIGGER IF EXISTS on_profile_info_update_client ON public.profiles;
CREATE TRIGGER on_profile_info_update_client
AFTER UPDATE OF full_name, phone ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'client')
EXECUTE FUNCTION public.sync_profile_to_client();

DROP TRIGGER IF EXISTS on_profile_info_update_realtor ON public.profiles;
CREATE TRIGGER on_profile_info_update_realtor
AFTER UPDATE OF full_name, phone ON public.profiles
FOR EACH ROW
WHEN (NEW.role = 'realtor')
EXECUTE FUNCTION public.sync_profile_to_realtor();

-- 6) BACKFILL FUNCTION: Sync existing profiles
-- ==========================================
-- Run this once after creating the triggers to sync existing data
CREATE OR REPLACE FUNCTION public.backfill_profile_sync()
RETURNS TABLE(clients_created INT, realtors_created INT) AS $$
DECLARE
  clients_count INT := 0;
  realtors_count INT := 0;
  profile_row RECORD;
  user_email TEXT;
BEGIN
  -- Sync all client profiles
  FOR profile_row IN 
    SELECT p.id, p.full_name, p.phone, p.role
    FROM public.profiles p
    WHERE p.role = 'client'
    AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.user_id = p.id)
  LOOP
    SELECT email INTO user_email FROM auth.users WHERE id = profile_row.id;
    
    INSERT INTO public.clients (user_id, full_name, email, phone, status, source)
    VALUES (
      profile_row.id,
      profile_row.full_name,
      user_email,
      profile_row.phone,
      'new',
      'quiz'
    );
    clients_count := clients_count + 1;
  END LOOP;

  -- Sync all realtor profiles
  FOR profile_row IN 
    SELECT p.id, p.full_name, p.phone, p.role
    FROM public.profiles p
    WHERE p.role = 'realtor'
    AND NOT EXISTS (SELECT 1 FROM public.realtors r WHERE r.user_id = p.id)
  LOOP
    SELECT email INTO user_email FROM auth.users WHERE id = profile_row.id;
    
    INSERT INTO public.realtors (user_id, full_name, email, phone, active, capacity)
    VALUES (
      profile_row.id,
      profile_row.full_name,
      user_email,
      profile_row.phone,
      TRUE,
      20
    );
    realtors_count := realtors_count + 1;
  END LOOP;

  RETURN QUERY SELECT clients_count, realtors_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on backfill function
GRANT EXECUTE ON FUNCTION public.backfill_profile_sync() TO authenticated;

-- ==========================================
-- USAGE:
-- ==========================================
-- After running this migration, run the backfill function once:
--   SELECT * FROM public.backfill_profile_sync();
-- 
-- This will create client/realtor records for existing profiles
-- that don't have them yet.
-- ==========================================
