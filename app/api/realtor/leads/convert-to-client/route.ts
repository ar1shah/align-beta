import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    const supabase = await createServerSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    // Create CRM client
    const { data: client, error: clientError } = await supabase
      .from('crm_clients')
      .insert({
        realtor_id: session.user.id,
        full_name: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        role: lead.buyer_or_seller,
        status: 'new',
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // Update lead stage to 'client'
    const { error: updateError } = await supabase
      .from('leads')
      .update({ stage: 'client' })
      .eq('id', leadId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error converting to client:', error);
    return NextResponse.json(
      { error: 'Failed to convert to client' },
      { status: 500 }
    );
  }
}

