import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { leadId, reason } = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('leads')
      .update({
        declined_by_realtor: true,
        decline_reason: reason,
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error declining lead:', error);
    return NextResponse.json(
      { error: 'Failed to decline lead' },
      { status: 500 }
    );
  }
}

