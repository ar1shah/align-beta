'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import {
  getClient,
  getRealtorWithNotificationSettings,
  getCurrentAssignmentForClient,
} from '@/lib/db/admin';
import {
  sendMatchNotification,
  sendNewLeadNotification,
  sendReassignmentClientNotification,
  sendReassignmentRealtorNotification,
} from '@/lib/email';

// ==========================================
// ASSIGNMENT ACTIONS
// ==========================================

export async function assignClientToRealtor(
  clientId: string,
  realtorId: string,
  reason?: string
) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if client already has an active assignment (for reassignment detection)
    const existingAssignment = await getCurrentAssignmentForClient(clientId);
    const isReassignment = existingAssignment !== null;

    const { error } = await supabase.rpc('assign_client_to_realtor', {
      p_client_id: clientId,
      p_realtor_id: realtorId,
      p_reason: reason || null,
    });

    if (error) throw error;

    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/clients');
    revalidatePath('/admin/realtors');
    revalidatePath('/admin/assignments');
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath(`/admin/realtors/${realtorId}`);
    
    // Revalidate client dashboard (for match display)
    revalidatePath('/dashboard');
    
    // Revalidate realtor dashboard (for new lead display)
    revalidatePath('/realtor');
    revalidatePath('/realtor/leads');

    // Send email notifications (async, don't block the response)
    sendAssignmentNotifications(clientId, realtorId, isReassignment).catch((err) => {
      console.error('Error sending assignment notifications:', err);
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning client:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to assign client' 
    };
  }
}

// ==========================================
// EMAIL NOTIFICATION HELPER
// ==========================================

async function sendAssignmentNotifications(
  clientId: string,
  realtorId: string,
  isReassignment: boolean
) {
  try {
    // Fetch client and realtor details
    const [client, realtor] = await Promise.all([
      getClient(clientId),
      getRealtorWithNotificationSettings(realtorId),
    ]);

    if (!client) {
      console.warn(`sendAssignmentNotifications: Client ${clientId} not found`);
      return;
    }

    if (!realtor) {
      console.warn(`sendAssignmentNotifications: Realtor ${realtorId} not found`);
      return;
    }

    // Get lead data for the realtor notification (created by the RPC function)
    const supabase = await createServerSupabaseClient();
    let leadDetails: {
      buyer_or_seller: string | null;
      price_target: number | null;
      area_pref: string | null;
    } | null = null;

    if (realtor.user_id && client.user_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('buyer_or_seller, price_target, area_pref')
        .eq('assigned_realtor_id', realtor.user_id)
        .eq('created_by_client_id', client.user_id)
        .single();
      
      leadDetails = lead;
    }

    // Send notifications based on whether this is a new assignment or reassignment
    if (isReassignment) {
      // Send reassignment notification to client
      if (client.email) {
        await sendReassignmentClientNotification({
          clientEmail: client.email,
          clientName: client.full_name || 'there',
          newRealtorName: realtor.full_name || 'Your New Agent',
          newRealtorEmail: realtor.email || '',
          newRealtorPhone: realtor.phone,
        });
      }

      // Send reassignment notification to new realtor (if notifications enabled)
      if (realtor.email && realtor.new_lead_alerts) {
        await sendReassignmentRealtorNotification({
          realtorEmail: realtor.email,
          realtorName: realtor.full_name || 'there',
          clientName: client.full_name || 'Unknown Client',
          clientEmail: client.email,
          clientPhone: client.phone,
        });
      }
    } else {
      // New assignment - send match notification to client
      if (client.email) {
        await sendMatchNotification({
          clientEmail: client.email,
          clientName: client.full_name || 'there',
          realtorName: realtor.full_name || 'Your Agent',
          realtorEmail: realtor.email || '',
          realtorPhone: realtor.phone,
        });
      }

      // Send new lead notification to realtor (if notifications enabled)
      if (realtor.email && realtor.new_lead_alerts) {
        await sendNewLeadNotification({
          realtorEmail: realtor.email,
          realtorName: realtor.full_name || 'there',
          clientName: client.full_name || 'Unknown Client',
          clientEmail: client.email,
          clientPhone: client.phone,
          buyerOrSeller: leadDetails?.buyer_or_seller || null,
          priceTarget: leadDetails?.price_target || null,
          areaPref: leadDetails?.area_pref || null,
        });
      }
    }

    console.log(`Assignment notifications sent for client ${clientId} to realtor ${realtorId} (reassignment: ${isReassignment})`);
  } catch (err) {
    console.error('sendAssignmentNotifications error:', err);
    // Don't throw - let the assignment succeed even if notifications fail
  }
}

export async function unassignClient(clientId: string, reason: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc('unassign_client', {
      p_client_id: clientId,
      p_reason: reason,
    });

    if (error) throw error;

    // Revalidate admin pages
    revalidatePath('/admin');
    revalidatePath('/admin/clients');
    revalidatePath('/admin/realtors');
    revalidatePath('/admin/assignments');
    revalidatePath(`/admin/clients/${clientId}`);
    
    // Revalidate client dashboard (match may no longer exist)
    revalidatePath('/dashboard');
    
    // Revalidate realtor dashboard (lead may be removed/updated)
    revalidatePath('/realtor');
    revalidatePath('/realtor/leads');

    return { success: true };
  } catch (error) {
    console.error('Error unassigning client:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unassign client' 
    };
  }
}

// ==========================================
// CLIENT ACTIONS
// ==========================================

export async function updateClientStatus(clientId: string, status: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc('update_client_status', {
      p_client_id: clientId,
      p_status: status,
    });

    if (error) throw error;

    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating client status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update status' 
    };
  }
}

export async function updateClient(
  clientId: string,
  updates: {
    full_name?: string;
    email?: string;
    phone?: string;
    tags?: string[];
    notes?: string;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId);

    if (error) throw error;

    revalidatePath('/admin/clients');
    revalidatePath(`/admin/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating client:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update client' 
    };
  }
}

export async function createClient(data: {
  full_name: string;
  email: string;
  phone?: string;
  status?: string;
  source?: string;
  tags?: string[];
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        ...data,
        status: data.status || 'new',
        source: data.source || 'manual',
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/clients');
    revalidatePath('/admin');

    return { success: true, client: newClient };
  } catch (error) {
    console.error('Error creating client:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create client' 
    };
  }
}

// ==========================================
// REALTOR ACTIONS
// ==========================================

export async function updateRealtorCapacity(realtorId: string, capacity: number) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc('update_realtor_capacity', {
      p_realtor_id: realtorId,
      p_capacity: capacity,
    });

    if (error) throw error;

    revalidatePath('/admin/realtors');
    revalidatePath(`/admin/realtors/${realtorId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating realtor capacity:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update capacity' 
    };
  }
}

export async function toggleRealtorActive(realtorId: string, active: boolean) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc('toggle_realtor_active', {
      p_realtor_id: realtorId,
      p_active: active,
    });

    if (error) throw error;

    revalidatePath('/admin/realtors');
    revalidatePath(`/admin/realtors/${realtorId}`);

    return { success: true };
  } catch (error) {
    console.error('Error toggling realtor active:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update status' 
    };
  }
}

export async function updateRealtor(
  realtorId: string,
  updates: {
    full_name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    msa_signed_at?: string | null;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('realtors')
      .update(updates)
      .eq('id', realtorId);

    if (error) throw error;

    revalidatePath('/admin/realtors');
    revalidatePath(`/admin/realtors/${realtorId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating realtor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update realtor' 
    };
  }
}

export async function createRealtor(data: {
  full_name: string;
  email: string;
  phone?: string;
  capacity?: number;
  active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: newRealtor, error } = await supabase
      .from('realtors')
      .insert({
        ...data,
        capacity: data.capacity || 20,
        active: data.active !== undefined ? data.active : true,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin/realtors');
    revalidatePath('/admin');

    return { success: true, realtor: newRealtor };
  } catch (error) {
    console.error('Error creating realtor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create realtor' 
    };
  }
}

// ==========================================
// NOTE ACTIONS
// ==========================================

export async function addClientNote(clientId: string, content: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('client_notes')
      .insert({
        client_id: clientId,
        author_id: session.user.id,
        content,
      });

    if (error) throw error;

    revalidatePath(`/admin/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding note:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add note' 
    };
  }
}

