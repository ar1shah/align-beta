import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { QuizSection } from '@/lib/quiz/types';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated (optional - can be public)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch quiz structure with embeddings
    const { data: sections, error } = await supabase
      .from('quiz_sections')
      .select(`
        *,
        quiz_questions(
          *,
          quiz_options(*)
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching quiz structure:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz structure' },
        { status: 500 }
      );
    }

    // Sort questions and options
    const sortedSections: QuizSection[] = (sections || []).map((section) => ({
      ...section,
      quiz_questions: (section.quiz_questions || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((question) => ({
          ...question,
          quiz_options: (question.quiz_options || []).sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        })),
    }));

    return NextResponse.json({
      sections: sortedSections,
      user_id: user?.id,
    });
  } catch (error) {
    console.error('Unexpected error fetching quiz structure:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

