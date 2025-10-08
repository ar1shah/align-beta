import { createServerSupabaseClient } from '@/lib/supabaseServer';

/**
 * Checks if a user has completed the quiz
 */
export async function hasUserCompletedQuiz(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: session } = await supabase
      .from('quiz_sessions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(1)
      .single();

    return Boolean(session);
  } catch (error) {
    // If no session exists or any error, consider quiz not completed
    return false;
  }
}

/**
 * Gets the current quiz session for a user
 */
export async function getCurrentQuizSession(userId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: session } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    return session;
  } catch (error) {
    return null;
  }
}
