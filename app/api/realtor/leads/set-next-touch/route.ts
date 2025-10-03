import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { leadId, nextTouchAt } = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('leads')
      .update({ next_touch_at: nextTouchAt })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error setting next touch:', error);
    return NextResponse.json(
      { error: 'Failed to set next touch' },
      { status: 500 }
    );
  }
}

