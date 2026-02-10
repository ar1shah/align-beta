import Link from 'next/link';
import { 
  UsersIcon, 
  UserCheckIcon, 
  FileTextIcon, 
  ArrowRightIcon,
  AlertCircle,
  Link2
} from 'lucide-react';
import { KPICard } from './_components/KPICard';
import { StatusBadge } from './_components/StatusBadge';
import { EmptyState } from './_components/EmptyState';
import { getDashboardStats, getUnassignedClients, getRecentQuizSessions, Client, QuizSubmission } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let stats = {
    totalClients: 0,
    unassignedClients: 0,
    activeRealtors: 0,
    newSubmissions: 0,
    capacityUtilization: 0,
  };
  let unassignedClients: Client[] = [];
  let recentSessions: QuizSubmission[] = [];
  let profileMap = new Map<string, string | null>();
  let error: string | null = null;

  try {
    [stats, unassignedClients, recentSessions] = await Promise.all([
      getDashboardStats(),
      getUnassignedClients(),
      getRecentQuizSessions(5),
    ]);

    // Get user info for recent sessions
    const supabase = await createServerSupabaseClient();
    const sessionUserIds = recentSessions.map((s) => s.user_id);
    
    if (sessionUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sessionUserIds);

      profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);
    }
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
    error = 'Failed to load dashboard data. Please try refreshing the page.';
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your CRM and operations</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-medium text-destructive">Error Loading Data</h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your CRM and operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in-up">
          <KPICard
            title="Total Clients"
            value={stats.totalClients}
            icon="users"
            variant="gradient"
          />
        </div>
        <div className="animate-fade-in-up animation-delay-100">
          <KPICard
            title="Unassigned Clients"
            value={stats.unassignedClients}
            icon="user-x"
          />
        </div>
        <div className="animate-fade-in-up animation-delay-200">
          <KPICard
            title="Active Realtors"
            value={stats.activeRealtors}
            icon="user-check"
          />
        </div>
        <div className="animate-fade-in-up animation-delay-300">
          <KPICard
            title="Capacity Utilization"
            value={`${stats.capacityUtilization}%`}
            icon="trending-up"
          />
        </div>
      </div>

      {/* Work Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Clients */}
        <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden animate-fade-in-up animation-delay-400">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Unassigned Clients</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {unassignedClients.length} client{unassignedClients.length !== 1 ? 's' : ''} waiting
              </p>
            </div>
            <Link
              href="/admin/clients?filter=unassigned"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {unassignedClients.length === 0 ? (
              <EmptyState
                icon="user-check"
                title="All caught up!"
                description="All clients have been assigned to realtors."
              />
            ) : (
              unassignedClients.slice(0, 5).map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="p-4 hover:bg-accent/50 transition-colors block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {client.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{client.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <StatusBadge status={client.status} size="sm" />
                      <span className="text-xs text-muted-foreground">
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
        <div className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden animate-fade-in-up animation-delay-500">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Quiz Submissions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Last 5 submissions
              </p>
            </div>
            <Link
              href="/admin/quizzes"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentSessions.length === 0 ? (
              <EmptyState
                icon="clipboard-list"
                title="No submissions yet"
                description="Quiz submissions will appear here."
              />
            ) : (
              recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/quizzes/${session.id}`}
                  className="p-4 hover:bg-accent/50 transition-colors block group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {profileMap.get(session.user_id) || 'Unknown User'}
                        </p>
                      </div>
                      {session.purpose && (
                        <p className="text-sm text-muted-foreground mt-0.5 ml-6 capitalize">
                          {session.purpose}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <StatusBadge status={session.status} size="sm" />
                      <span className="text-xs text-muted-foreground">
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
          className="group relative p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Manage Clients</h3>
            <p className="text-sm text-muted-foreground mt-1">View and manage all clients</p>
          </div>
        </Link>

        <Link
          href="/admin/realtors"
          className="group relative p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UserCheckIcon className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-semibold text-foreground">Manage Realtors</h3>
            <p className="text-sm text-muted-foreground mt-1">View capacity and assignments</p>
          </div>
        </Link>

        <Link
          href="/admin/assignments"
          className="group relative p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Link2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-foreground">Assignments</h3>
            <p className="text-sm text-muted-foreground mt-1">Assign clients to realtors</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
