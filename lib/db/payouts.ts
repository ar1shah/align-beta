import { createServerSupabaseClient } from '../supabaseServer';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

export interface Payout {
  id: string;
  created_at: string;
  realtor_id: string;
  deal_id: string;
  fee_percent: number | null;
  amount: number | null;
  status: PayoutStatus;
  payment_ref: string | null;
  statement_path: string | null;
}

export async function getRealtorPayouts(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payout[];
}

