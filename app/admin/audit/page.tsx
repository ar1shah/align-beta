import { AlertCircle } from 'lucide-react';
import { getAuditLogs, AuditLog } from '@/lib/db/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { AuditLogClient } from './_components/AuditLogClient';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  let logs: AuditLog[] = [];
  let error: string | null = null;
  let actorMap = new Map<string, string | null>();

  try {
    logs = await getAuditLogs(200); // Get last 200 logs
    const supabase = await createServerSupabaseClient();

    // Get actor names
    const actorIds = [...new Set(logs.map((l) => l.actor_user_id).filter(Boolean))];
    
    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', actorIds as string[]);

      actorMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);
    }
  } catch (err) {
    console.error('Error loading audit page:', err);
    error = 'Failed to load audit logs. Please try refreshing the page.';
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all administrative actions and changes</p>
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

  const logsWithActors = logs.map((log) => ({
    ...log,
    actor_name: log.actor_user_id ? actorMap.get(log.actor_user_id) || 'Unknown' : 'System',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 mt-1">Track all administrative actions and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Assignments</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {logs.filter((l) => l.action.includes('ASSIGN')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Status Changes</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {logs.filter((l) => l.action.includes('STATUS')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Capacity Updates</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {logs.filter((l) => l.action.includes('CAPACITY')).length}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <AuditLogClient logs={logsWithActors} />
    </div>
  );
}

