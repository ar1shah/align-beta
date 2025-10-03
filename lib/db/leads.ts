import { createServerSupabaseClient } from '../supabaseServer';

export type LeadStage = 'new' | 'working' | 'nurture' | 'lost' | 'client';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  created_by_client_id: string | null;
  assigned_realtor_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  buyer_or_seller: 'buyer' | 'seller' | null;
  price_target: number | null;
  area_pref: string | null;
  lead_source: string | null;
  next_step: string | null;
  next_touch_at: string | null;
  stage: LeadStage;
  declined_by_realtor: boolean;
  decline_reason: string | null;
}

export async function getRealtorLeads(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('assigned_realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function updateLeadStage(leadId: string, stage: LeadStage) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .update({ stage })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function declineLead(leadId: string, reason: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .update({
      declined_by_realtor: true,
      decline_reason: reason,
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLeadNextTouch(leadId: string, nextTouchAt: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .update({ next_touch_at: nextTouchAt })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

