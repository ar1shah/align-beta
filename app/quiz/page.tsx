import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { QuizSection } from '@/lib/quiz/types';
import { StartQuizForm } from './_components/StartQuizForm';
import { CheckCircle, Clock, Shield } from 'lucide-react';

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
  const sortedSections: QuizSection[] = (sections || []).map((section) => ({
    ...section,
    quiz_questions: (section.quiz_questions || [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((question: { quiz_options?: { sort_order: number }[]; [key: string]: unknown }) => ({
        ...question,
        quiz_options: (question.quiz_options || []).sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
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

  const features = [
    {
      icon: Clock,
      title: 'Quick & Easy',
      description: 'Most questions are multiple choice. Skip what you don\'t know.',
    },
    {
      icon: Shield,
      title: 'Your answers are saved',
      description: 'Come back anytime to finish where you left off.',
    },
    {
      icon: CheckCircle,
      title: 'Personalized matching',
      description: 'We\'ll find the perfect realtor based on your needs.',
    },
  ];

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <Image 
              src="/alignicon.png" 
              alt="Align" 
              width={36} 
              height={36}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-xl font-bold gradient-text">Align</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center p-4 py-12">
        <div className="max-w-2xl w-full animate-fade-in-up">
          <div className="bg-card rounded-2xl shadow-soft-lg border border-border/50 p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Let&apos;s find your perfect match
              </h1>
              <p className="text-lg text-muted-foreground">
                Take our quick 2-3 minute quiz to get matched with the right realtor for
                your needs.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-4 p-4 bg-accent/50 rounded-xl transition-all duration-200 hover:bg-accent"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <StartQuizForm sections={sortedSections} />
          </div>
        </div>
      </main>
    </div>
  );
}
