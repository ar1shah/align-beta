import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        phone: body.phone,
      })
      .eq('id', body.realtor_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating base profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

