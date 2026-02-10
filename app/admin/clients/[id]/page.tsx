import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';
import { 
  getClientWithAssignment, 
  getClientQuizSessions, 
  getAssignmentHistory,
  getAllRealtors,
  Client,
  Realtor,
  QuizSubmission
} from '@/lib/db/admin';
import { StatusBadge } from '../../_components/StatusBadge';
import { ClientDetailClient } from './_components/ClientDetailClient';

export const dynamic = 'force-dynamic';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  
  let client: Client | null = null;
  let assignment: Awaited<ReturnType<typeof getClientWithAssignment>>['assignment'] = null;
  let quizSessions: QuizSubmission[] = [];
  let assignmentHistory: Awaited<ReturnType<typeof getAssignmentHistory>> = [];
  let realtors: Realtor[] = [];
  let error: string | null = null;

  try {
    const result = await getClientWithAssignment(id);
    client = result.client;
    assignment = result.assignment;
    
    [quizSessions, assignmentHistory, realtors] = await Promise.all([
      getClientQuizSessions(id),
      getAssignmentHistory(id),
      getAllRealtors(),
    ]);
  } catch (err) {
    console.error('Error loading client detail:', err);
    // Check if it's a "not found" error
    if (err instanceof Error && err.message.includes('No rows')) {
      notFound();
    }
    error = 'Failed to load client data. Please try again.';
  }

  if (!client) {
    notFound();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
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
          href="/admin/clients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{client.full_name}</h1>
          <p className="text-gray-500 mt-1">Client Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{client.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{client.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(client.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={client.status} />
                </div>
              </div>
              {client.source && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="text-sm font-medium text-gray-900">{client.source}</p>
                  </div>
                </div>
              )}
              {client.tags && client.tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Submissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Submissions</h2>
            {quizSessions.length === 0 ? (
              <p className="text-sm text-gray-500">No quiz submissions yet</p>
            ) : (
              <div className="space-y-3">
                {quizSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/admin/quizzes/${session.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.purpose || 'General Quiz'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Started: {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Assignment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment History</h2>
            {assignmentHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No assignment history</p>
            ) : (
              <div className="space-y-3">
                {assignmentHistory.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {assignment.realtor?.full_name || 'Unknown Realtor'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                        {assignment.unassigned_at && (
                          <p className="text-sm text-gray-500">
                            Unassigned: {new Date(assignment.unassigned_at).toLocaleDateString()}
                          </p>
                        )}
                        {assignment.reason && (
                          <p className="text-xs text-gray-400 mt-1">
                            Reason: {assignment.reason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.unassigned_at
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {assignment.unassigned_at ? 'Past' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Assignment */}
          <ClientDetailClient
            client={client}
            assignment={assignment}
            realtors={realtors}
          />

          {/* Notes */}
          {client.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

