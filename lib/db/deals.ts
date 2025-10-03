import { createServerSupabaseClient } from '../supabaseServer';

export type DealStage = 'lead' | 'client' | 'under_contract' | 'closed';

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  realtor_id: string;
  lead_id: string | null;
  client_id: string | null;
  stage: DealStage;
  property_address: string | null;
  mls_link: string | null;
  offer_price: number | null;
  close_date: string | null;
  escrow_title_info: string | null;
  side: 'listing' | 'buy' | null;
  cda_storage_path: string | null;
  hud_storage_path: string | null;
}

export async function getRealtorDeals(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Deal[];
}

export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('deals')
    .insert(deal)
    .select()
    .single();

  if (error) throw error;
  return data as Deal;
}

