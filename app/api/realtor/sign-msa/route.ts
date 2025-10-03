import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { realtorId } = await request.json();

    const supabase = await createServerSupabaseClient();

    // Verify the user is a realtor
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || session.user.id !== realtorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create MSA contract
    const { data, error } = await supabase
      .from('referral_contracts')
      .insert({
        realtor_id: realtorId,
        type: 'msa',
        status: 'completed',
        countersigned: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error signing MSA:', error);
    return NextResponse.json(
      { error: 'Failed to sign MSA' },
      { status: 500 }
    );
  }
}

