import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/_components/Button';
import { CheckCircle2, Home, Mail, Clock, Users } from 'lucide-react';

export default async function QuizCompletePage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/quiz');
  }

  // Get the most recent completed session
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    redirect('/quiz');
  }

  // Get responses count
  const { count: responsesCount } = await supabase
    .from('quiz_responses')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', session.id);

  const steps = [
    {
      icon: Users,
      title: 'Matching in progress',
      description: 'Our algorithm is analyzing your responses to find realtors that match your needs, location, and communication style.',
    },
    {
      icon: Mail,
      title: 'Email notification',
      description: 'You\'ll receive an email within 24 hours with your top realtor matches.',
    },
    {
      icon: Clock,
      title: 'Schedule consultation',
      description: 'Review their profiles and schedule a free consultation with your favorite match.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
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
          <div className="bg-card rounded-2xl shadow-soft-lg border border-border/50 p-8 md:p-12 text-center">
          {/* Success icon */}
          <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </div>

          {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            You&apos;re all set!
          </h1>
            <p className="text-lg text-muted-foreground mb-8">
            Thank you for completing the quiz. We&apos;re now matching you with the perfect
            realtor.
          </p>

          {/* Summary card */}
            <div className="bg-accent/50 rounded-xl p-6 mb-10">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                  {responsesCount || 0}
                </div>
                  <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                  {session.completed_at
                    ? new Date(session.completed_at).toLocaleDateString()
                    : 'Today'}
                </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>

          {/* What happens next */}
            <div className="text-left mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              What happens next?
            </h2>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={step.title}
                    className="flex items-start gap-4 p-4 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-brand text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
                      <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                  </p>
                </div>
                </div>
                ))}
                </div>
          </div>

          {/* CTA */}
          <Link href="/dashboard">
              <Button fullWidth variant="brand" size="xl" className="group">
                <Home className="w-5 h-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      </main>
    </div>
  );
}
