import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('realtor_profile')
      .upsert({
        realtor_id: body.realtor_id,
        bio: body.bio || null,
        website: body.website || null,
        license_number: body.license_number || null,
        license_states: body.license_states || null,
        license_expiration: body.license_expiration || null,
        brokerage_name: body.brokerage_name || null,
        brokerage_address: body.brokerage_address || null,
        coverage_cities: body.coverage_cities || null,
        coverage_counties: body.coverage_counties || null,
        coverage_zips: body.coverage_zips || null,
        price_bands: body.price_bands || null,
        property_types: body.property_types || null,
        new_lead_alerts: body.new_lead_alerts ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating realtor profile:', error);
    return NextResponse.json(
      { error: 'Failed to update realtor profile' },
      { status: 500 }
    );
  }
}

