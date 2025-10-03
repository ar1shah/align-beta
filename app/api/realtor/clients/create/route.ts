import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('crm_clients')
      .insert({
        realtor_id: body.realtor_id,
        full_name: body.full_name,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || null,
        timeline: body.timeline || null,
        status: body.status || 'new',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

