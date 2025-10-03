import { createServerSupabaseClient } from '../supabaseServer';

export type EntityType = 'lead' | 'client' | 'deal' | 'appointment';

export interface Note {
  id: string;
  created_at: string;
  created_by: string;
  entity_type: EntityType;
  entity_id: string;
  body: string;
}

export async function getNotes(entityType: EntityType, entityId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Note[];
}

export async function createNote(note: Omit<Note, 'id' | 'created_at'>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

