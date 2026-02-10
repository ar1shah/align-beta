import Link from 'next/link';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { getAllQuizSessions, QuizSubmission } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { StatusBadge } from '../_components/StatusBadge';
import { ExportButton } from '../_components/ExportButton';

export const dynamic = 'force-dynamic';

export default async function QuizzesPage() {
  let sessions: QuizSubmission[] = [];
  let error: string | null = null;
  let profileMap = new Map<string, string | null>();
  let clientMap = new Map<string, { user_id: string; id: string; full_name: string | null; email: string | null }>();

  try {
    sessions = await getAllQuizSessions();
    const supabase = await createServerSupabaseClient();

    // Get user info for sessions
    const userIds = [...new Set(sessions.map((s) => s.user_id))];
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      // Get clients for sessions
      const { data: clients } = await supabase
        .from('clients')
        .select('user_id, id, full_name, email')
        .in('user_id', userIds);

      clientMap = new Map(clients?.map((c) => [c.user_id!, c]) || []);
    }
  } catch (err) {
    console.error('Error loading quizzes page:', err);
    error = 'Failed to load quiz data. Please try refreshing the page.';
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Submissions</h1>
          <p className="text-gray-500 mt-1">Browse and review client quiz responses</p>
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

  const sessionsWithUser = sessions.map((s) => ({
    ...s,
    user_name: profileMap.get(s.user_id) || 'Unknown User',
    client: clientMap.get(s.user_id),
  }));

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Submissions</h1>
          <p className="text-gray-500 mt-1">Browse and review client quiz responses</p>
        </div>
        <ExportButton 
          data={sessionsWithUser.map(({ client, ...s }) => ({
            ...s,
            client_name: client?.full_name || 'N/A',
            client_email: client?.email || 'N/A',
          }))} 
          filename="quiz-submissions" 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">All Submissions</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User / Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessionsWithUser.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No quiz submissions yet
                  </td>
                </tr>
              ) : (
                sessionsWithUser.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{session.user_name}</p>
                      {session.client && (
                        <Link
                          href={`/admin/clients/${session.client.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {session.client.email}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.purpose || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(session.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {session.completed_at
                        ? new Date(session.completed_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/quizzes/${session.id}`}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        View Answers
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

