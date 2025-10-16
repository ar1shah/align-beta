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
// CLIENTS
// ==========================================

export async function getAllClients() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Client[];
}

export async function getClient(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Client;
}

export async function getClientWithAssignment(id: string) {
  const supabase = await createServerSupabaseClient();
  
  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (clientError) throw clientError;

  // Get current assignment
  const { data: assignment } = await supabase
    .from('client_realtor_assignments')
    .select(`
      *,
      realtor:realtors(*)
    `)
    .eq('client_id', id)
    .is('unassigned_at', null)
    .single();

  return { client: client as Client, assignment };
}

export async function getUnassignedClients() {
  const supabase = await createServerSupabaseClient();
  
  // Get all clients
  const { data: allClients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (clientsError) throw clientsError;

  // Get all active assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('client_realtor_assignments')
    .select('client_id')
    .is('unassigned_at', null);

  if (assignmentsError) throw assignmentsError;

  const assignedClientIds = new Set(assignments.map((a) => a.client_id));
  
  return allClients.filter((c) => !assignedClientIds.has(c.id)) as Client[];
}

// ==========================================
// REALTORS
// ==========================================

export async function getAllRealtors() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data as Realtor[];
}

export async function getRealtor(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Realtor;
}

export async function getRealtorWithClients(id: string) {
  const supabase = await createServerSupabaseClient();
  
  // Get realtor
  const { data: realtor, error: realtorError } = await supabase
    .from('realtors')
    .select('*')
    .eq('id', id)
    .single();

  if (realtorError) throw realtorError;

  // Get assigned clients
  const { data: assignments, error: assignmentsError } = await supabase
    .from('client_realtor_assignments')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('realtor_id', id)
    .is('unassigned_at', null);

  if (assignmentsError) throw assignmentsError;

  return { 
    realtor: realtor as Realtor, 
    assignments: assignments as (Assignment & { client: Client })[]
  };
}

export async function getActiveRealtors() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('realtors')
    .select('*')
    .eq('active', true)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data as Realtor[];
}

// ==========================================
// ASSIGNMENTS
// ==========================================

export async function getAllAssignments() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('client_realtor_assignments')
    .select(`
      *,
      client:clients(*),
      realtor:realtors(*),
      assigner:assigned_by(*)
    `)
    .is('unassigned_at', null)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAssignmentHistory(clientId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('client_realtor_assignments')
    .select(`
      *,
      realtor:realtors(full_name, email)
    `)
    .eq('client_id', clientId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ==========================================
// QUIZ SUBMISSIONS
// ==========================================

export async function getClientQuizSessions(clientId: string) {
  const supabase = await createServerSupabaseClient();
  
  // First get the user_id for this client
  const { data: client } = await supabase
    .from('clients')
    .select('user_id')
    .eq('id', clientId)
    .single();

  if (!client?.user_id) return [];

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', client.user_id)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data as QuizSubmission[];
}

export async function getQuizSessionWithResponses(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;

  const { data: responses, error: responsesError } = await supabase
    .from('quiz_responses')
    .select(`
      *,
      question:quiz_questions(*)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (responsesError) throw responsesError;

  return { session: session as QuizSubmission, responses };
}

export async function getAllQuizSessions() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data as QuizSubmission[];
}

export async function getRecentQuizSessions(limit: number = 10) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as QuizSubmission[];
}

// ==========================================
// AUDIT LOGS
// ==========================================

export async function getAuditLogs(limit: number = 100) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLog[];
}

export async function getAuditLogsByEntity(entityType: string, entityId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AuditLog[];
}

// ==========================================
// CLIENT NOTES
// ==========================================

export async function getClientNotes(clientId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ClientNote[];
}

export async function createClientNote(clientId: string, content: string) {
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

  if (error) throw error;
  return data as ClientNote;
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();

  // Total clients
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // Unassigned clients
  const unassignedClients = await getUnassignedClients();

  // Active realtors
  const { count: activeRealtors } = await supabase
    .from('realtors')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  // New submissions in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: newSubmissions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('started_at', sevenDaysAgo.toISOString());

  // Calculate capacity utilization
  const realtors = await getAllRealtors();
  const activeRealtorsList = realtors.filter(r => r.active);
  
  const { data: activeAssignments } = await supabase
    .from('client_realtor_assignments')
    .select('realtor_id')
    .is('unassigned_at', null);

  const assignmentCounts = new Map<string, number>();
  activeAssignments?.forEach((a) => {
    const count = assignmentCounts.get(a.realtor_id) || 0;
    assignmentCounts.set(a.realtor_id, count + 1);
  });

  let totalCapacity = 0;
  let totalAssigned = 0;
  activeRealtorsList.forEach((r) => {
    totalCapacity += r.capacity;
    totalAssigned += assignmentCounts.get(r.id) || 0;
  });

  const capacityUtilization = totalCapacity > 0 
    ? Math.round((totalAssigned / totalCapacity) * 100) 
    : 0;

  return {
    totalClients: totalClients || 0,
    unassignedClients: unassignedClients.length,
    activeRealtors: activeRealtors || 0,
    newSubmissions: newSubmissions || 0,
    capacityUtilization,
  };
}

