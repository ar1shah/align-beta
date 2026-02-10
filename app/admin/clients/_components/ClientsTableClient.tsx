'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, UserPlus, ExternalLink } from 'lucide-react';
import { Client, Realtor } from '@/lib/db/admin';
import { StatusBadge } from '../../_components/StatusBadge';
import { AssignClientDialog } from '../../_components/AssignClientDialog';
import { EmptyState } from '../../_components/EmptyState';
import { cn } from '@/lib/utils';

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
    <div className="bg-card rounded-xl shadow-soft border border-border/50">
      {/* Filters */}
      <div className="p-4 border-b border-border/50 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'placeholder:text-muted-foreground transition-all duration-200'
              )}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'px-4 py-2.5 rounded-lg border border-input bg-background text-sm',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'transition-all duration-200'
            )}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredClients.length}</span> of{' '}
          <span className="font-medium text-foreground">{initialClients.length}</span> clients
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 first:rounded-tl-lg">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 last:rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="users"
                    title="No clients found"
                    description={searchTerm || statusFilter !== 'all' 
                      ? "Try adjusting your search or filter criteria" 
                      : "Clients will appear here once they complete the quiz"}
                  />
                </td>
              </tr>
            ) : (
              filteredClients.map((client, index) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-accent/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{client.email}</div>
                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">
                    {client.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setAssignDialogClient(client)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Assign to realtor"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
