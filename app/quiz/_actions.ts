'use server';

import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { QuizSession, QuizResponse, QuizValue } from '@/lib/quiz/types';
import { revalidatePath } from 'next/cache';

export async function startQuizSession(
  purpose: string,
  categories: string[]
): Promise<{ success: boolean; session?: QuizSession; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Call RPC to start session
    const { data, error } = await supabase.rpc('start_quiz_session', {
      purpose_in: purpose,
      cats_in: categories,
    });

    if (error) {
      console.error('Error starting quiz session:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/quiz');
    return { success: true, session: data };
  } catch (error) {
    console.error('Unexpected error starting quiz session:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function upsertQuizResponse(
  sessionId: string,
  questionId: string,
  value: QuizValue
): Promise<{ success: boolean; response?: QuizResponse; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Call RPC to upsert response
    const { data, error } = await supabase.rpc('upsert_quiz_response', {
      session_in: sessionId,
      question_in: questionId,
      value_in: value,
    });

    if (error) {
      console.error('Error saving quiz response:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/quiz');
    return { success: true, response: data };
  } catch (error) {
    console.error('Unexpected error saving quiz response:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function completeQuizSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update session status
    const { error } = await supabase
      .from('quiz_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error completing quiz session:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/quiz');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error completing quiz session:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getCurrentSession(): Promise<{
  success: boolean;
  session?: QuizSession;
  error?: string;
}> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get the most recent session
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error fetching current session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, session: data || undefined };
  } catch (error) {
    console.error('Unexpected error fetching current session:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getSessionResponses(sessionId: string): Promise<{
  success: boolean;
  responses?: QuizResponse[];
  error?: string;
}> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all responses for this session
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching session responses:', error);
      return { success: false, error: error.message };
    }

    return { success: true, responses: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching session responses:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

