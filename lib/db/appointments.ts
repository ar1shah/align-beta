import { createServerSupabaseClient } from '../supabaseServer';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'no_show' | 'completed';

export interface Appointment {
  id: string;
  created_at: string;
  updated_at: string;
  realtor_id: string;
  lead_id: string | null;
  client_id: string | null;
  title: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string | null;
}

export async function getRealtorAppointments(realtorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('start_at', { ascending: true });

  if (error) throw error;
  return data as Appointment[];
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

