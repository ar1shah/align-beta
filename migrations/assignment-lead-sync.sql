-- Migration: Assignment Lead Sync
-- This migration updates the assign_client_to_realtor function to also create
-- a lead record for the realtor dashboard.
-- 
-- Problem: When admin assigns a client to a realtor, no lead record is created.
-- The realtor dashboard queries the 'leads' table by assigned_realtor_id,
-- which should be the realtor's user_id (auth.users.id), not realtors.id.
--
-- Solution: Modify assign_client_to_realtor to:
-- 1. Create a lead record with assigned_realtor_id = realtors.user_id
-- 2. Pull client info and quiz data into the lead

-- Drop and recreate the function with lead creation
CREATE OR REPLACE FUNCTION public.assign_client_to_realtor(
  p_client_id UUID, 
  p_realtor_id UUID, 
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_realtor_user_id UUID;
  v_client_user_id UUID;
  v_client_name TEXT;
  v_client_email TEXT;
  v_client_phone TEXT;
  v_client_source TEXT;
  v_quiz_session_id UUID;
  v_purpose TEXT;
  v_buyer_or_seller TEXT;
  v_buy_budget TEXT;
  v_sell_price TEXT;
  v_price_target NUMERIC;
  v_buy_areas TEXT;
  v_sell_city TEXT;
  v_area_pref TEXT;
  v_existing_lead_id UUID;
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

  -- Get realtor's user_id (this is what the realtor dashboard uses)
  SELECT user_id INTO v_realtor_user_id
  FROM public.realtors
  WHERE id = p_realtor_id;

  -- Get client info
  SELECT user_id, full_name, email, phone, source
  INTO v_client_user_id, v_client_name, v_client_email, v_client_phone, v_client_source
  FROM public.clients
  WHERE id = p_client_id;

  -- Only create lead if realtor has a user_id
  IF v_realtor_user_id IS NOT NULL THEN
    -- Check if a lead already exists for this client-realtor pair
    -- Note: created_by_client_id references auth.users, so use v_client_user_id
    SELECT id INTO v_existing_lead_id
    FROM public.leads
    WHERE created_by_client_id = v_client_user_id 
      AND assigned_realtor_id = v_realtor_user_id;

    -- Get the latest completed quiz session for this client
    IF v_client_user_id IS NOT NULL THEN
      SELECT id INTO v_quiz_session_id
      FROM public.quiz_sessions
      WHERE user_id = v_client_user_id
        AND status = 'completed'
      ORDER BY completed_at DESC NULLS LAST, started_at DESC
      LIMIT 1;

      -- If we have a quiz session, extract relevant data
      IF v_quiz_session_id IS NOT NULL THEN
        -- Get purpose (buy/sell/both/exploring)
        SELECT qr.value->>'selected'
        INTO v_purpose
        FROM public.quiz_responses qr
        JOIN public.quiz_questions qq ON qq.id = qr.question_id
        WHERE qr.session_id = v_quiz_session_id
          AND qq.key = 'purpose';

        -- Map purpose to buyer_or_seller
        v_buyer_or_seller := CASE 
          WHEN v_purpose = 'buy' THEN 'buyer'
          WHEN v_purpose = 'sell' THEN 'seller'
          WHEN v_purpose = 'both' THEN 'buyer' -- Default to buyer for both
          ELSE NULL
        END;

        -- Get buy_budget
        SELECT qr.value->>'selected'
        INTO v_buy_budget
        FROM public.quiz_responses qr
        JOIN public.quiz_questions qq ON qq.id = qr.question_id
        WHERE qr.session_id = v_quiz_session_id
          AND qq.key = 'buy_budget';

        -- Convert buy_budget to numeric estimate
        v_price_target := CASE v_buy_budget
          WHEN 'lt_200' THEN 150000
          WHEN '200_350' THEN 275000
          WHEN '350_500' THEN 425000
          WHEN '500_750' THEN 625000
          WHEN '750_1m' THEN 875000
          WHEN 'gt_1m' THEN 1250000
          ELSE NULL
        END;

        -- If no buy budget but they're selling, get sell price
        IF v_price_target IS NULL THEN
          SELECT (qr.value->>'amount')::NUMERIC
          INTO v_price_target
          FROM public.quiz_responses qr
          JOIN public.quiz_questions qq ON qq.id = qr.question_id
          WHERE qr.session_id = v_quiz_session_id
            AND qq.key = 'sell_asking_price';
        END IF;

        -- Get buy_areas (multi-choice, so it's an array in 'selections')
        SELECT array_to_string(
          ARRAY(SELECT jsonb_array_elements_text(qr.value->'selections')),
          ', '
        )
        INTO v_buy_areas
        FROM public.quiz_responses qr
        JOIN public.quiz_questions qq ON qq.id = qr.question_id
        WHERE qr.session_id = v_quiz_session_id
          AND qq.key = 'buy_areas';

        -- Get sell city/zip as fallback for area
        IF v_buy_areas IS NULL OR v_buy_areas = '' THEN
          SELECT qr.value->>'text'
          INTO v_sell_city
          FROM public.quiz_responses qr
          JOIN public.quiz_questions qq ON qq.id = qr.question_id
          WHERE qr.session_id = v_quiz_session_id
            AND qq.key = 'sell_city_zip';
        END IF;

        v_area_pref := COALESCE(NULLIF(v_buy_areas, ''), v_sell_city);
      END IF;
    END IF;

    -- Create or update lead record
    IF v_existing_lead_id IS NOT NULL THEN
      -- Update existing lead
      UPDATE public.leads
      SET 
        full_name = COALESCE(v_client_name, full_name),
        email = COALESCE(v_client_email, email),
        phone = COALESCE(v_client_phone, phone),
        buyer_or_seller = COALESCE(v_buyer_or_seller, buyer_or_seller),
        price_target = COALESCE(v_price_target, price_target),
        area_pref = COALESCE(v_area_pref, area_pref),
        stage = 'new',
        declined_by_realtor = false,
        decline_reason = NULL,
        updated_at = now()
      WHERE id = v_existing_lead_id;
    ELSE
      -- Insert new lead
      -- Note: created_by_client_id references auth.users, so use v_client_user_id (not p_client_id)
      INSERT INTO public.leads (
        created_by_client_id,
        assigned_realtor_id,
        full_name,
        email,
        phone,
        buyer_or_seller,
        price_target,
        area_pref,
        lead_source,
        stage,
        declined_by_realtor
      ) VALUES (
        v_client_user_id,  -- Use client's user_id (references auth.users), not clients.id
        v_realtor_user_id,
        COALESCE(v_client_name, 'Unknown'),
        v_client_email,
        v_client_phone,
        v_buyer_or_seller,
        v_price_target,
        v_area_pref,
        COALESCE(v_client_source, 'platform'),
        'new',
        false
      );
    END IF;
  END IF;

  -- Audit
  INSERT INTO public.audit_logs(actor_user_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(), 
    'ASSIGN_CLIENT', 
    'client', 
    p_client_id, 
    jsonb_build_object('realtor_id', p_realtor_id, 'reason', p_reason, 'lead_created', v_realtor_user_id IS NOT NULL)
  );
END; $$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.assign_client_to_realtor(UUID, UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.assign_client_to_realtor IS 
'Assigns a client to a realtor. Creates assignment record, updates client status, 
creates/updates lead record for realtor dashboard, and logs audit trail.';

-- ==========================================
-- FIX: REMOVE PROBLEMATIC RLS POLICIES
-- ==========================================
-- The previous policies caused infinite recursion. Drop them.

DROP POLICY IF EXISTS client_read_own_assignment ON public.client_realtor_assignments;
DROP POLICY IF EXISTS client_read_assigned_realtor ON public.realtors;

-- ==========================================
-- SECURITY DEFINER FUNCTION FOR CLIENT DASHBOARD
-- ==========================================
-- Instead of RLS policies, use a function that bypasses RLS to get client's assignment

CREATE OR REPLACE FUNCTION public.get_client_assignment_for_user(p_user_id UUID)
RETURNS TABLE (
  client_id UUID,
  client_full_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  realtor_id UUID,
  realtor_full_name TEXT,
  realtor_email TEXT,
  realtor_phone TEXT,
  assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS client_id,
    c.full_name AS client_full_name,
    c.email AS client_email,
    c.phone AS client_phone,
    r.id AS realtor_id,
    r.full_name AS realtor_full_name,
    r.email AS realtor_email,
    r.phone AS realtor_phone,
    a.assigned_at
  FROM public.clients c
  JOIN public.client_realtor_assignments a ON a.client_id = c.id AND a.unassigned_at IS NULL
  JOIN public.realtors r ON r.id = a.realtor_id
  WHERE c.user_id = p_user_id;
END; $$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_client_assignment_for_user(UUID) TO authenticated;
