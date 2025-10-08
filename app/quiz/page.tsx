import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { QuizSection } from '@/lib/quiz/types';
import { StartQuizForm } from './_components/StartQuizForm';

export default async function QuizPage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/quiz');
  }

  // Fetch quiz structure
  const { data: sections } = await supabase
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

  // Sort questions and options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedSections: QuizSection[] = (sections || []).map((section: any) => ({
    ...section,
    quiz_questions: (section.quiz_questions || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (a?.sort_order || 0) - (b?.sort_order || 0))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((question: any) => ({
        ...question,
        quiz_options: (question.quiz_options || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a?.sort_order || 0) - (b?.sort_order || 0)),
      })),
  }));

  // Check for existing session
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  // If completed, redirect to completion page
  if (session?.status === 'completed') {
    redirect('/quiz/complete');
  }

  // If in progress, redirect to first incomplete section
  if (session?.status === 'in_progress') {
    // Get responses
    const { data: responses } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('session_id', session.id);

    const responseMap = new Set(
      (responses || []).map((r) => r.question_id)
    );

    // Find first section with unanswered required questions
    for (const section of sortedSections) {
      const hasUnanswered = section.quiz_questions?.some(
        (q) => q.required && !responseMap.has(q.id)
      );
      if (hasUnanswered || section.key === 'entry') {
        redirect(`/quiz/${section.key}`);
      }
    }

    // All sections complete, go to contact
    const contactSection = sortedSections.find((s) => s.key === 'contact');
    if (contactSection) {
      redirect(`/quiz/${contactSection.key}`);
    }
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Let&apos;s find your perfect match
            </h1>
            <p className="text-lg text-gray-600">
              Take our quick 2-3 minute quiz to get matched with the right realtor for
              your needs.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Quick & Easy
                </h3>
                <p className="text-sm text-gray-600">
                  Most questions are multiple choice. Skip what you don&apos;t know.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Your answers are saved
                </h3>
                <p className="text-sm text-gray-600">
                  Come back anytime to finish where you left off.
                </p>
              </div>
            </div>
          </div>

          <StartQuizForm sections={sortedSections} />
        </div>
      </div>
    </div>
  );
}

