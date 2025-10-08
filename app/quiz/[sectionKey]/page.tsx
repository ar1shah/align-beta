import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { QuizSection, QuizResponse } from '@/lib/quiz/types';
import { isVisible, buildAnswersMap } from '@/lib/quiz/visibility';
import { SectionForm } from '../_components/SectionForm';

interface SectionPageProps {
  params: Promise<{ sectionKey: string }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { sectionKey } = await params;
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

  // Find current section
  const currentSection = sortedSections.find((s) => s.key === sectionKey);

  if (!currentSection) {
    redirect('/quiz');
  }

  // Get or create session
  let { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    // Create new session if none exists
    const { data: newSession } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        status: 'in_progress',
      })
      .select()
      .single();
    session = newSession;
  }

  if (!session) {
    redirect('/quiz');
  }

  // If session is completed, redirect to complete page
  if (session.status === 'completed') {
    redirect('/quiz/complete');
  }

  // Get all responses
  const { data: responses } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('session_id', session.id);

  const allResponses: QuizResponse[] = responses || [];

  // Build answers map for visibility checks
  const allQuestions = sortedSections.flatMap(
    (s) => s.quiz_questions || []
  );
  const answersMap = buildAnswersMap(allResponses, allQuestions);

  // Check if current section is visible
  if (!isVisible(currentSection.visible_if, answersMap)) {
    redirect('/quiz');
  }

  // Filter visible questions in this section
  const visibleQuestions = (currentSection.quiz_questions || []).filter((q) =>
    isVisible(q.visible_if, answersMap)
  );

  // Find section index and determine navigation
  const currentIndex = sortedSections.findIndex((s) => s.key === sectionKey);
  const visibleSections = sortedSections.filter((s) =>
    isVisible(s.visible_if, answersMap)
  );

  const prevSection = currentIndex > 0 ? sortedSections[currentIndex - 1] : null;

  // Find next visible section
  let nextVisibleSection = null;
  for (let i = currentIndex + 1; i < sortedSections.length; i++) {
    if (isVisible(sortedSections[i].visible_if, answersMap)) {
      nextVisibleSection = sortedSections[i];
      break;
    }
  }

  // Calculate completion status for all sections
  const completionMap: Record<string, { answered: number; required: number }> = {};
  for (const section of visibleSections) {
    const sectionQuestions = (section.quiz_questions || []).filter((q) =>
      isVisible(q.visible_if, answersMap)
    );
    const requiredQuestions = sectionQuestions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter((q) =>
      allResponses.some((r) => r.question_id === q.id)
    );

    completionMap[section.key] = {
      answered: answeredRequired.length,
      required: requiredQuestions.length,
    };
  }

  return (
    <SectionForm
      section={currentSection}
      questions={visibleQuestions}
      responses={allResponses}
      sessionId={session.id}
      sections={visibleSections}
      completionMap={completionMap}
      prevSectionKey={prevSection?.key}
      nextSectionKey={nextVisibleSection?.key}
      isLastSection={currentSection.key === 'contact'}
    />
  );
}

