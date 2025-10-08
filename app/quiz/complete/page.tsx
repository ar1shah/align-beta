import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { Button } from '@/app/_components/Button';
import { CheckCircle2, Home } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're all set!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for completing the quiz. We're now matching you with the perfect
            realtor.
          </p>

          {/* Summary card */}
          <div className="bg-primary-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {responsesCount || 0}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {session.completed_at
                    ? new Date(session.completed_at).toLocaleDateString()
                    : 'Today'}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="text-left mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    Our algorithm is analyzing your responses to find realtors that match
                    your needs, location, and communication style.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    You'll receive an email within 24 hours with your top 3 realtor
                    matches.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    Review their profiles and schedule a free consultation with your
                    favorite match.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link href="/dashboard">
            <Button fullWidth className="text-lg py-4">
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

