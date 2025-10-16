'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, UserPlus, ExternalLink } from 'lucide-react';
import { Client, Realtor } from '@/lib/db/admin';
import { StatusBadge } from '../../_components/StatusBadge';
import { AssignClientDialog } from '../../_components/AssignClientDialog';

interface ClientsTableClientProps {
  clients: Client[];
  realtors: Realtor[];
}

export function ClientsTableClient({ clients: initialClients, realtors }: ClientsTableClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogClient, setAssignDialogClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return initialClients.filter((client) => {
      const matchesSearch =
        !searchTerm ||
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialClients, searchTerm, statusFilter]);

  const statuses = ['all', ...new Set(initialClients.map((c) => c.status))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredClients.length} of {initialClients.length} clients
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAssignDialogClient(client)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Assign to realtor"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Dialog */}
      {assignDialogClient && (
        <AssignClientDialog
          clientId={assignDialogClient.id}
          clientName={assignDialogClient.full_name || 'Unknown'}
          realtors={realtors}
          onClose={() => setAssignDialogClient(null)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

