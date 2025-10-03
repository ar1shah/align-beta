import { createServerSupabaseClient } from '../supabaseServer';

export interface RealtorProfile {
  realtor_id: string;
  photo_url: string | null;
  bio: string | null;
  website: string | null;
  license_number: string | null;
  license_states: string[] | null;
  license_expiration: string | null;
  brokerage_name: string | null;
  brokerage_address: string | null;
  coverage_cities: string[] | null;
  coverage_counties: string[] | null;
  coverage_zips: string[] | null;
  price_bands: string[] | null;
  property_types: string[] | null;
  new_lead_alerts: boolean;
  two_factor_enabled: boolean;
}

export async function getRealtorProfile(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('realtor_profile')
    .select('*')
    .eq('realtor_id', realtorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as RealtorProfile | null;
}

export async function upsertRealtorProfile(profile: RealtorProfile) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('realtor_profile')
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as RealtorProfile;
}

