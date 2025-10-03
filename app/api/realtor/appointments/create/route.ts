import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        realtor_id: body.realtor_id,
        title: body.title,
        start_at: body.start_at,
        end_at: body.end_at,
        notes: body.notes || null,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

