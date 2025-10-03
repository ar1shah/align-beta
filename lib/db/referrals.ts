import { createServerSupabaseClient } from '../supabaseServer';

export type ContractStatus = 'pending_signature' | 'active' | 'completed';

export interface ReferralContract {
  id: string;
  created_at: string;
  updated_at: string;
  realtor_id: string;
  type: 'msa' | 'deal';
  status: ContractStatus;
  fee_percent: number | null;
  territory: string | null;
  countersigned: boolean;
  linked_deal_id: string | null;
  document_path: string | null;
}

export async function getRealtorContracts(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('referral_contracts')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReferralContract[];
}

export async function signMSA(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('referral_contracts')
    .insert({
      realtor_id: realtorId,
      type: 'msa',
      status: 'completed',
      countersigned: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ReferralContract;
}

