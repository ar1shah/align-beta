import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('deals')
      .insert({
        realtor_id: body.realtor_id,
        property_address: body.property_address || null,
        mls_link: body.mls_link || null,
        offer_price: body.offer_price || null,
        side: body.side || null,
        stage: body.stage || 'lead',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

