import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { leadId, stage } = await request.json();

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('leads')
      .update({ stage })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating lead stage:', error);
    return NextResponse.json(
      { error: 'Failed to update lead stage' },
      { status: 500 }
    );
  }
}

