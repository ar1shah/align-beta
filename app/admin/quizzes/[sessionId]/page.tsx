import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { getQuizSessionWithResponses, QuizSubmission, Client } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { StatusBadge } from '../../_components/StatusBadge';
import { QuizAnswerViewer } from './_components/QuizAnswerViewer';
import { ExportQuizButton } from './_components/ExportQuizButton';

export const dynamic = 'force-dynamic';

interface QuizDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { sessionId } = await params;
  
  let session: QuizSubmission | null = null;
  let responses: Awaited<ReturnType<typeof getQuizSessionWithResponses>>['responses'] = [];
  let profile: { full_name: string | null } | null = null;
  let client: Client | null = null;
  let error: string | null = null;

  try {
    const result = await getQuizSessionWithResponses(sessionId);
    session = result.session;
    responses = result.responses;
    
    const supabase = await createServerSupabaseClient();
    
    // Get user info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user_id)
      .single();
    profile = profileData;

    // Get client info if exists
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user_id)
      .single();
    client = clientData;
  } catch (err) {
    console.error('Error loading quiz detail:', err);
    // Check if it's a "not found" error
    if (err instanceof Error && err.message.includes('No rows')) {
      notFound();
    }
    error = 'Failed to load quiz data. Please try again.';
  }

  if (!session) {
    notFound();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/quizzes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Submission</h1>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Data</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/quizzes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Submission</h1>
          <p className="text-gray-500 mt-1">
            {profile?.full_name || 'Unknown User'}
          </p>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">User</p>
            <p className="font-medium text-gray-900 mt-1">
              {profile?.full_name || 'Unknown'}
            </p>
            {client && (
              <Link
                href={`/admin/clients/${client.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
              >
                View Client Profile →
              </Link>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium text-gray-900 mt-1">
              {session.purpose || 'General'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={session.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Started</p>
            <p className="font-medium text-gray-900 mt-1">
              {new Date(session.started_at).toLocaleString()}
            </p>
            {session.completed_at && (
              <p className="text-xs text-gray-500 mt-1">
                Completed: {new Date(session.completed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {session.selected_categories && session.selected_categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {session.selected_categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Responses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Responses</h2>
            <span className="text-sm text-gray-500">({responses.length} answers)</span>
          </div>
          <ExportQuizButton sessionId={sessionId} responses={responses} />
        </div>

        {responses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No responses yet</p>
        ) : (
          <QuizAnswerViewer responses={responses} />
        )}
      </div>
    </div>
  );
}

