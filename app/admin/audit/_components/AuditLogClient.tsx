'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { AuditLog } from '@/lib/db/admin';

interface AuditLogWithActor extends AuditLog {
  actor_name: string;
}

interface AuditLogClientProps {
  logs: AuditLogWithActor[];
}

const actionColors: Record<string, string> = {
  ASSIGN_CLIENT: 'bg-blue-100 text-blue-800',
  UNASSIGN_CLIENT: 'bg-orange-100 text-orange-800',
  UPDATE_CLIENT_STATUS: 'bg-purple-100 text-purple-800',
  UPDATE_REALTOR_CAPACITY: 'bg-green-100 text-green-800',
  TOGGLE_REALTOR_ACTIVE: 'bg-gray-100 text-gray-800',
};

export function AuditLogClient({ logs }: AuditLogClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const actions = ['all', ...new Set(logs.map((l) => l.action))];
  const entities = ['all', ...new Set(logs.map((l) => l.entity))];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchTerm, actionFilter, entityFilter]);

  const formatMeta = (meta: Record<string, unknown> | null) => {
    if (!meta) return null;
    
    return Object.entries(meta).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-medium text-gray-600">{key}:</span>{' '}
        <span className="text-gray-800">{JSON.stringify(value)}</span>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by action, actor, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {actions.map((action) => (
              <option key={action} value={action}>
                {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {entities.map((entity) => (
              <option key={entity} value={entity}>
                {entity === 'all' ? 'All Entities' : entity.charAt(0).toUpperCase() + entity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} events
        </div>
      </div>

      {/* Log Entries */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit logs found
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        actionColors[log.action] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-600">by</span>
                    <span className="text-sm font-medium text-gray-900">{log.actor_name}</span>
                    <span className="text-sm text-gray-600">on</span>
                    <span className="text-sm font-medium text-gray-900">{log.entity}</span>
                  </div>
                  
                  {log.meta && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
                      {formatMeta(log.meta)}
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

