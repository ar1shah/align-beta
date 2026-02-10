import { createServerSupabaseClient } from '../supabaseServer';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Client {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Realtor {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  msa_signed_at: string | null;
  capacity: number;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  client_id: string;
  realtor_id: string | null;
  assigned_by: string | null;
  assigned_at: string;
  unassigned_at: string | null;
  reason: string | null;
}

export interface AuditLog {
  id: number;
  actor_user_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface QuizSubmission {
  id: string;
  user_id: string;
  status: string;
  purpose: string | null;
  selected_categories: string[] | null;
  started_at: string;
  completed_at: string | null;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  session_id: string;
  question_id: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ==========================================
// ERROR HANDLING HELPER
// ==========================================

class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ==========================================
// CLIENTS
// ==========================================

export async function getAllClients(): Promise<Client[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all clients:', error);
      throw new DatabaseError('Failed to fetch clients', error);
    }
    return (data || []) as Client[];
  } catch (err) {
    console.error('getAllClients error:', err);
    throw err;
  }
}

export async function getClient(id: string): Promise<Client | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching client:', error);
      throw new DatabaseError('Failed to fetch client', error);
    }
    return data as Client;
  } catch (err) {
    console.error('getClient error:', err);
    throw err;
  }
}

export async function getClientWithAssignment(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      if (clientError.code === 'PGRST116') {
        throw new Error('No rows returned');
      }
      console.error('Error fetching client with assignment:', clientError);
      throw new DatabaseError('Failed to fetch client', clientError);
    }

    // Get current assignment (may not exist)
    const { data: assignment, error: assignmentError } = await supabase
      .from('client_realtor_assignments')
      .select(`
        *,
        realtor:realtors(*)
      `)
      .eq('client_id', id)
      .is('unassigned_at', null)
      .single();

    // Ignore "no rows" error for assignment - it just means client is unassigned
    if (assignmentError && assignmentError.code !== 'PGRST116') {
      console.error('Error fetching assignment:', assignmentError);
    }

    return { client: client as Client, assignment: assignment || null };
  } catch (err) {
    console.error('getClientWithAssignment error:', err);
    throw err;
  }
}

export async function getUnassignedClients(): Promise<Client[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all clients
    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw new DatabaseError('Failed to fetch clients', clientsError);
    }

    // Get all active assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('client_realtor_assignments')
      .select('client_id')
      .is('unassigned_at', null);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      throw new DatabaseError('Failed to fetch assignments', assignmentsError);
    }

    const assignedClientIds = new Set((assignments || []).map((a) => a.client_id));
    
    return (allClients || []).filter((c) => !assignedClientIds.has(c.id)) as Client[];
  } catch (err) {
    console.error('getUnassignedClients error:', err);
    throw err;
  }
}

// ==========================================
// REALTORS
// ==========================================

export async function getAllRealtors(): Promise<Realtor[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('realtors')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching all realtors:', error);
      throw new DatabaseError('Failed to fetch realtors', error);
    }
    return (data || []) as Realtor[];
  } catch (err) {
    console.error('getAllRealtors error:', err);
    throw err;
  }
}

export async function getRealtor(id: string): Promise<Realtor | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('realtors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching realtor:', error);
      throw new DatabaseError('Failed to fetch realtor', error);
    }
    return data as Realtor;
  } catch (err) {
    console.error('getRealtor error:', err);
    throw err;
  }
}

export async function getRealtorWithClients(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get realtor
    const { data: realtor, error: realtorError } = await supabase
      .from('realtors')
      .select('*')
      .eq('id', id)
      .single();

    if (realtorError) {
      if (realtorError.code === 'PGRST116') {
        throw new Error('No rows returned');
      }
      console.error('Error fetching realtor:', realtorError);
      throw new DatabaseError('Failed to fetch realtor', realtorError);
    }

    // Get assigned clients
    const { data: assignments, error: assignmentsError } = await supabase
      .from('client_realtor_assignments')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('realtor_id', id)
      .is('unassigned_at', null);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      throw new DatabaseError('Failed to fetch assignments', assignmentsError);
    }

    return { 
      realtor: realtor as Realtor, 
      assignments: (assignments || []) as (Assignment & { client: Client })[]
    };
  } catch (err) {
    console.error('getRealtorWithClients error:', err);
    throw err;
  }
}

export async function getActiveRealtors(): Promise<Realtor[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('realtors')
      .select('*')
      .eq('active', true)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching active realtors:', error);
      throw new DatabaseError('Failed to fetch active realtors', error);
    }
    return (data || []) as Realtor[];
  } catch (err) {
    console.error('getActiveRealtors error:', err);
    throw err;
  }
}

// ==========================================
// ASSIGNMENTS
// ==========================================

export async function getAllAssignments() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('client_realtor_assignments')
      .select(`
        *,
        client:clients(*),
        realtor:realtors(*)
      `)
      .is('unassigned_at', null)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching all assignments:', error);
      throw new DatabaseError('Failed to fetch assignments', error);
    }
    return data || [];
  } catch (err) {
    console.error('getAllAssignments error:', err);
    throw err;
  }
}

export async function getAssignmentHistory(clientId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('client_realtor_assignments')
      .select(`
        *,
        realtor:realtors(full_name, email)
      `)
      .eq('client_id', clientId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignment history:', error);
      throw new DatabaseError('Failed to fetch assignment history', error);
    }
    return data || [];
  } catch (err) {
    console.error('getAssignmentHistory error:', err);
    throw err;
  }
}

// ==========================================
// QUIZ SUBMISSIONS
// ==========================================

export async function getClientQuizSessions(clientId: string): Promise<QuizSubmission[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // First get the user_id for this client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Error fetching client for quiz sessions:', clientError);
    }

    if (!client?.user_id) return [];

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', client.user_id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz sessions:', error);
      throw new DatabaseError('Failed to fetch quiz sessions', error);
    }
    return (data || []) as QuizSubmission[];
  } catch (err) {
    console.error('getClientQuizSessions error:', err);
    throw err;
  }
}

export async function getQuizSessionWithResponses(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        throw new Error('No rows returned');
      }
      console.error('Error fetching quiz session:', sessionError);
      throw new DatabaseError('Failed to fetch quiz session', sessionError);
    }

    const { data: responses, error: responsesError } = await supabase
      .from('quiz_responses')
      .select(`
        *,
        question:quiz_questions(*)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (responsesError) {
      console.error('Error fetching quiz responses:', responsesError);
      throw new DatabaseError('Failed to fetch quiz responses', responsesError);
    }

    return { session: session as QuizSubmission, responses: responses || [] };
  } catch (err) {
    console.error('getQuizSessionWithResponses error:', err);
    throw err;
  }
}

export async function getAllQuizSessions(): Promise<QuizSubmission[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching all quiz sessions:', error);
      throw new DatabaseError('Failed to fetch quiz sessions', error);
    }
    return (data || []) as QuizSubmission[];
  } catch (err) {
    console.error('getAllQuizSessions error:', err);
    throw err;
  }
}

export async function getRecentQuizSessions(limit: number = 10): Promise<QuizSubmission[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent quiz sessions:', error);
      throw new DatabaseError('Failed to fetch recent quiz sessions', error);
    }
    return (data || []) as QuizSubmission[];
  } catch (err) {
    console.error('getRecentQuizSessions error:', err);
    throw err;
  }
}

// ==========================================
// AUDIT LOGS
// ==========================================

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new DatabaseError('Failed to fetch audit logs', error);
    }
    return (data || []) as AuditLog[];
  } catch (err) {
    console.error('getAuditLogs error:', err);
    throw err;
  }
}

export async function getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs by entity:', error);
      throw new DatabaseError('Failed to fetch audit logs', error);
    }
    return (data || []) as AuditLog[];
  } catch (err) {
    console.error('getAuditLogsByEntity error:', err);
    throw err;
  }
}

// ==========================================
// CLIENT NOTES
// ==========================================

export async function getClientNotes(clientId: string): Promise<ClientNote[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client notes:', error);
      throw new DatabaseError('Failed to fetch client notes', error);
    }
    return (data || []) as ClientNote[];
  } catch (err) {
    console.error('getClientNotes error:', err);
    throw err;
  }
}

export async function createClientNote(clientId: string, content: string): Promise<ClientNote> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: clientId,
        author_id: session.user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client note:', error);
      throw new DatabaseError('Failed to create client note', error);
    }
    return data as ClientNote;
  } catch (err) {
    console.error('createClientNote error:', err);
    throw err;
  }
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
  try {
    const supabase = await createServerSupabaseClient();

    // Total clients
    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (clientsError) {
      console.error('Error counting clients:', clientsError);
    }

    // Unassigned clients
    let unassignedClientsCount = 0;
    try {
      const unassignedClients = await getUnassignedClients();
      unassignedClientsCount = unassignedClients.length;
    } catch (err) {
      console.error('Error getting unassigned clients:', err);
    }

    // Active realtors
    const { count: activeRealtors, error: realtorsError } = await supabase
      .from('realtors')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (realtorsError) {
      console.error('Error counting active realtors:', realtorsError);
    }

    // New submissions in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: newSubmissions, error: submissionsError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', sevenDaysAgo.toISOString());

    if (submissionsError) {
      console.error('Error counting new submissions:', submissionsError);
    }

    // Calculate capacity utilization
    let capacityUtilization = 0;
    try {
      const realtors = await getAllRealtors();
      const activeRealtorsList = realtors.filter(r => r.active);
      
      const { data: activeAssignments, error: assignmentsError } = await supabase
        .from('client_realtor_assignments')
        .select('realtor_id')
        .is('unassigned_at', null);

      if (assignmentsError) {
        console.error('Error fetching active assignments:', assignmentsError);
      }

      const assignmentCounts = new Map<string, number>();
      activeAssignments?.forEach((a) => {
        if (a.realtor_id) {
          const count = assignmentCounts.get(a.realtor_id) || 0;
          assignmentCounts.set(a.realtor_id, count + 1);
        }
      });

      let totalCapacity = 0;
      let totalAssigned = 0;
      activeRealtorsList.forEach((r) => {
        totalCapacity += r.capacity;
        totalAssigned += assignmentCounts.get(r.id) || 0;
      });

      capacityUtilization = totalCapacity > 0 
        ? Math.round((totalAssigned / totalCapacity) * 100) 
        : 0;
    } catch (err) {
      console.error('Error calculating capacity utilization:', err);
    }

    return {
      totalClients: totalClients || 0,
      unassignedClients: unassignedClientsCount,
      activeRealtors: activeRealtors || 0,
      newSubmissions: newSubmissions || 0,
      capacityUtilization,
    };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    // Return default values instead of throwing
    return {
      totalClients: 0,
      unassignedClients: 0,
      activeRealtors: 0,
      newSubmissions: 0,
      capacityUtilization: 0,
    };
  }
}

// ==========================================
// CLIENT ASSIGNMENT BY USER ID
// ==========================================

export interface ClientAssignment {
  client: Client;
  realtor: Realtor;
  assigned_at: string;
}

export async function getClientAssignmentByUserId(userId: string): Promise<ClientAssignment | null> {
  try {
    const supabase = await createServerSupabaseClient();

    // Use the SECURITY DEFINER function to bypass RLS and avoid recursion
    const { data, error } = await supabase
      .rpc('get_client_assignment_for_user', { p_user_id: userId });

    if (error) {
      console.error('Error fetching client assignment:', error);
      return null;
    }

    // The function returns an array, get the first result
    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];

    // Build the Client and Realtor objects from the flat result
    const client: Client = {
      id: row.client_id,
      user_id: userId,
      full_name: row.client_full_name,
      email: row.client_email,
      phone: row.client_phone,
      status: 'assigned',
      source: 'quiz',
      tags: null,
      notes: null,
      created_at: '',
      updated_at: '',
    };

    const realtor: Realtor = {
      id: row.realtor_id,
      user_id: null,
      full_name: row.realtor_full_name,
      email: row.realtor_email,
      phone: row.realtor_phone,
      msa_signed_at: null,
      capacity: 0,
      active: true,
      notes: null,
      created_at: '',
      updated_at: '',
    };

    return {
      client,
      realtor,
      assigned_at: row.assigned_at,
    };
  } catch (err) {
    console.error('getClientAssignmentByUserId error:', err);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
}

// ==========================================
// REALTOR WITH NOTIFICATION SETTINGS
// ==========================================

export interface RealtorWithSettings extends Realtor {
  new_lead_alerts: boolean;
}

export async function getRealtorWithNotificationSettings(realtorId: string): Promise<RealtorWithSettings | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get realtor info
    const { data: realtor, error: realtorError } = await supabase
      .from('realtors')
      .select('*')
      .eq('id', realtorId)
      .single();

    if (realtorError) {
      if (realtorError.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching realtor:', realtorError);
      return null;
    }

    // Get notification settings from realtor_profile
    // Note: realtor_profile uses user_id as the key (realtor_id column)
    let newLeadAlerts = true; // Default to true if no settings exist
    
    if (realtor.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('realtor_profile')
        .select('new_lead_alerts')
        .eq('realtor_id', realtor.user_id)
        .single();

      if (!profileError && profile) {
        newLeadAlerts = profile.new_lead_alerts ?? true;
      }
    }

    return {
      ...(realtor as Realtor),
      new_lead_alerts: newLeadAlerts,
    };
  } catch (err) {
    console.error('getRealtorWithNotificationSettings error:', err);
    return null;
  }
}

// ==========================================
// GET CURRENT ASSIGNMENT FOR CLIENT
// ==========================================

export async function getCurrentAssignmentForClient(clientId: string): Promise<{
  realtor: Realtor;
  assigned_at: string;
} | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('client_realtor_assignments')
      .select(`
        assigned_at,
        realtor:realtors(*)
      `)
      .eq('client_id', clientId)
      .is('unassigned_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No active assignment
      }
      console.error('Error fetching current assignment:', error);
      return null;
    }

    // Supabase returns joined relations as arrays
    const realtorData = Array.isArray(data.realtor) ? data.realtor[0] : data.realtor;
    
    if (!data || !realtorData) {
      return null;
    }

    return {
      realtor: realtorData as Realtor,
      assigned_at: data.assigned_at,
    };
  } catch (err) {
    console.error('getCurrentAssignmentForClient error:', err);
    return null;
  }
}

