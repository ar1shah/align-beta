import Link from 'next/link';
import { 
  UsersIcon, 
  UserXIcon, 
  UserCheckIcon, 
  FileTextIcon, 
  TrendingUpIcon,
  ArrowRightIcon 
} from 'lucide-react';
import { KPICard } from './_components/KPICard';
import { StatusBadge } from './_components/StatusBadge';
import { getDashboardStats, getUnassignedClients, getRecentQuizSessions } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const unassignedClients = await getUnassignedClients();
  const recentSessions = await getRecentQuizSessions(5);

  // Get user info for recent sessions
  const supabase = await createServerSupabaseClient();
  const sessionUserIds = recentSessions.map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', sessionUserIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your CRM and operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Clients"
          value={stats.totalClients}
          icon={UsersIcon}
        />
        <KPICard
          title="Unassigned Clients"
          value={stats.unassignedClients}
          icon={UserXIcon}
        />
        <KPICard
          title="Active Realtors"
          value={stats.activeRealtors}
          icon={UserCheckIcon}
        />
        <KPICard
          title="Capacity Utilization"
          value={`${stats.capacityUtilization}%`}
          icon={TrendingUpIcon}
        />
      </div>

      {/* Work Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Unassigned Clients</h2>
              <p className="text-sm text-gray-500 mt-1">
                {unassignedClients.length} client{unassignedClients.length !== 1 ? 's' : ''} waiting
              </p>
            </div>
            <Link
              href="/admin/clients?filter=unassigned"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {unassignedClients.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                All clients are assigned!
              </div>
            ) : (
              unassignedClients.slice(0, 5).map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{client.full_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={client.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(client.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Quiz Submissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Quiz Submissions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Last 5 submissions
              </p>
            </div>
            <Link
              href="/admin/quizzes"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSessions.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No recent submissions
              </div>
            ) : (
              recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/quizzes/${session.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {profileMap.get(session.user_id) || 'Unknown User'}
                        </p>
                      </div>
                      {session.purpose && (
                        <p className="text-sm text-gray-500 mt-0.5 ml-6">{session.purpose}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={session.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(session.started_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/clients"
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200"
        >
          <UsersIcon className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Manage Clients</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage all clients</p>
        </Link>

        <Link
          href="/admin/realtors"
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200"
        >
          <UserCheckIcon className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Manage Realtors</h3>
          <p className="text-sm text-gray-600 mt-1">View capacity and assignments</p>
        </Link>

        <Link
          href="/admin/assignments"
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border border-green-200"
        >
          <TrendingUpIcon className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Assignments</h3>
          <p className="text-sm text-gray-600 mt-1">Assign clients to realtors</p>
        </Link>
      </div>
    </div>
  );
}

