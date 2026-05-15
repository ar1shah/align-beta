-- ==========================================
-- ALIGN - ADMIN PANEL MIGRATION
-- ==========================================


-- 1) HELPER FUNCTIONS FOR ROLE CHECKS
-- ==========================================

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_realtor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'realtor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_client() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'client'
  );
$$;

CREATE OR REPLACE FUNCTION public.require_admin() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
END; $$;

-- 2) REALTORS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.realtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  msa_signed_at TIMESTAMPTZ,
  capacity INTEGER DEFAULT 20,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_realtors_active ON public.realtors(active);
CREATE INDEX IF NOT EXISTS idx_realtors_user_id ON public.realtors(user_id);

-- Add updated_at trigger for realtors
DROP TRIGGER IF EXISTS trigger_realtors_updated_at ON public.realtors;
CREATE TRIGGER trigger_realtors_updated_at
BEFORE UPDATE ON public.realtors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) CLIENTS TABLE (FOR ADMIN SYSTEM)
-- ==========================================
-- Note: This is separate from crm_clients which is per-realtor

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new', -- new, qualified, contacted, assigned, active, closed, lost
  source TEXT DEFAULT 'quiz', -- quiz, referral, import, manual
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created ON public.clients(created_at DESC);

-- Add updated_at trigger for clients
DROP TRIGGER IF EXISTS trigger_clients_updated_at ON public.clients;
CREATE TRIGGER trigger_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) CLIENT-REALTOR ASSIGNMENTS (WITH HISTORY)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.client_realtor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  realtor_id UUID REFERENCES public.realtors(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  reason TEXT
);

-- Only one active assignment per client
CREATE UNIQUE INDEX IF NOT EXISTS uniq_client_active_assignment
ON public.client_realtor_assignments(client_id)
WHERE unassigned_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cra_realtor_active
ON public.client_realtor_assignments(realtor_id)
WHERE unassigned_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_cra_client ON public.client_realtor_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_cra_realtor ON public.client_realtor_assignments(realtor_id);
CREATE INDEX IF NOT EXISTS idx_cra_assigned_at ON public.client_realtor_assignments(assigned_at DESC);

-- View: current active assignments
CREATE OR REPLACE VIEW public.v_current_assignments AS
SELECT DISTINCT ON (a.client_id) a.*
FROM public.client_realtor_assignments a
WHERE a.unassigned_at IS NULL
ORDER BY a.client_id, a.assigned_at DESC;

-- 5) AUDIT LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- 6) CLIENT NOTES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON public.client_notes(client_id, created_at DESC);

-- Add updated_at trigger for client_notes
DROP TRIGGER IF EXISTS trigger_client_notes_updated_at ON public.client_notes;
CREATE TRIGGER trigger_client_notes_updated_at
BEFORE UPDATE ON public.client_notes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_realtor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Admin: Full access to everything
DO $$ BEGIN
  DROP POLICY IF EXISTS admin_all_realtors ON public.realtors;
  CREATE POLICY admin_all_realtors ON public.realtors
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_all_clients ON public.clients;
  CREATE POLICY admin_all_clients ON public.clients
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_all_assignments ON public.client_realtor_assignments;
  CREATE POLICY admin_all_assignments ON public.client_realtor_assignments
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_all_audit_logs ON public.audit_logs;
  CREATE POLICY admin_all_audit_logs ON public.audit_logs
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_all_client_notes ON public.client_notes;
  CREATE POLICY admin_all_client_notes ON public.client_notes
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtor: Read only assigned clients
DO $$ BEGIN
  DROP POLICY IF EXISTS realtor_read_clients ON public.clients;
  CREATE POLICY realtor_read_clients ON public.clients FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_realtor_assignments a
      JOIN public.realtors r ON r.id = a.realtor_id
      WHERE a.client_id = clients.id
        AND a.unassigned_at IS NULL
        AND r.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS realtor_read_assignments ON public.client_realtor_assignments;
  CREATE POLICY realtor_read_assignments ON public.client_realtor_assignments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.realtors r
      WHERE r.id = client_realtor_assignments.realtor_id
        AND r.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS realtor_read_client_notes ON public.client_notes;
  CREATE POLICY realtor_read_client_notes ON public.client_notes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.client_realtor_assignments a
      JOIN public.realtors r ON r.id = a.realtor_id
      WHERE a.client_id = client_notes.client_id
        AND a.unassigned_at IS NULL
        AND r.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Client: Read own client record
DO $$ BEGIN
  DROP POLICY IF EXISTS client_read_self ON public.clients;
  CREATE POLICY client_read_self ON public.clients FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update quiz RLS for admin access (additive, don't break existing)
DO $$ BEGIN
  DROP POLICY IF EXISTS admin_read_quiz_sessions ON public.quiz_sessions;
  CREATE POLICY admin_read_quiz_sessions ON public.quiz_sessions 
    FOR SELECT USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_read_quiz_responses ON public.quiz_responses;
  CREATE POLICY admin_read_quiz_responses ON public.quiz_responses 
    FOR SELECT USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8) ADMIN RPC FUNCTIONS
-- ==========================================

-- Assign a client to a realtor (reassigns if one is active)
CREATE OR REPLACE FUNCTION public.assign_client_to_realtor(
  p_client_id UUID, 
  p_realtor_id UUID, 
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.require_admin();

  -- Close any active assignment
  UPDATE public.client_realtor_assignments
  SET unassigned_at = now(), 
      reason = COALESCE(reason, 'reassigned')
  WHERE client_id = p_client_id AND unassigned_at IS NULL;

  -- Create new assignment
  INSERT INTO public.client_realtor_assignments(client_id, realtor_id, assigned_by)
  VALUES (p_client_id, p_realtor_id, auth.uid());

  -- Update client status
  UPDATE public.clients
  SET status = 'assigned', updated_at = now()
  WHERE id = p_client_id AND status = 'new';

  -- Audit
  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(), 
    'ASSIGN_CLIENT', 
    'client', 
    p_client_id, 
    jsonb_build_object('realtor_id', p_realtor_id, 'reason', p_reason)
  );
END; $$;

-- Unassign active assignment
CREATE OR REPLACE FUNCTION public.unassign_client(
  p_client_id UUID, 
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.require_admin();

  UPDATE public.client_realtor_assignments
  SET unassigned_at = now(), reason = p_reason
  WHERE client_id = p_client_id AND unassigned_at IS NULL;

  -- Update client status back to qualified
  UPDATE public.clients
  SET status = 'qualified', updated_at = now()
  WHERE id = p_client_id;

  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(), 
    'UNASSIGN_CLIENT', 
    'client', 
    p_client_id, 
    jsonb_build_object('reason', p_reason)
  );
END; $$;

-- Update client status with audit
CREATE OR REPLACE FUNCTION public.update_client_status(
  p_client_id UUID,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  old_status TEXT;
BEGIN
  PERFORM public.require_admin();

  SELECT status INTO old_status FROM public.clients WHERE id = p_client_id;

  UPDATE public.clients
  SET status = p_status, updated_at = now()
  WHERE id = p_client_id;

  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'UPDATE_CLIENT_STATUS',
    'client',
    p_client_id,
    jsonb_build_object('old_status', old_status, 'new_status', p_status)
  );
END; $$;

-- Update realtor capacity with audit
CREATE OR REPLACE FUNCTION public.update_realtor_capacity(
  p_realtor_id UUID,
  p_capacity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  old_capacity INTEGER;
BEGIN
  PERFORM public.require_admin();

  SELECT capacity INTO old_capacity FROM public.realtors WHERE id = p_realtor_id;

  UPDATE public.realtors
  SET capacity = p_capacity, updated_at = now()
  WHERE id = p_realtor_id;

  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'UPDATE_REALTOR_CAPACITY',
    'realtor',
    p_realtor_id,
    jsonb_build_object('old_capacity', old_capacity, 'new_capacity', p_capacity)
  );
END; $$;

-- Toggle realtor active status
CREATE OR REPLACE FUNCTION public.toggle_realtor_active(
  p_realtor_id UUID,
  p_active BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.require_admin();

  UPDATE public.realtors
  SET active = p_active, updated_at = now()
  WHERE id = p_realtor_id;

  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'TOGGLE_REALTOR_ACTIVE',
    'realtor',
    p_realtor_id,
    jsonb_build_object('active', p_active)
  );
END; $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.assign_client_to_realtor(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unassign_client(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_client_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_realtor_capacity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_realtor_active(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_realtor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_client() TO authenticated;

-- ==========================================
-- ✅ ADMIN PANEL MIGRATION COMPLETE!
-- ==========================================
-- Next steps:
-- 1. Set your admin role:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
--
-- 2. (Optional) Seed test data:
--    See the seed data SQL below
-- ==========================================

