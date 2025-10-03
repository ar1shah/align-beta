import { createServerSupabaseClient } from '../supabaseServer';

export type ClientStatus = 'new' | 'active' | 'under_contract' | 'closed';

export interface CrmClient {
  id: string;
  created_at: string;
  updated_at: string;
  realtor_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: 'buyer' | 'seller' | null;
  timeline: string | null;
  criteria: any;
  property_links: string[] | null;
  status: ClientStatus;
}

export async function getRealtorClients(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('crm_clients')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CrmClient[];
}

export async function createClient(client: Omit<CrmClient, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('crm_clients')
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data as CrmClient;
}

