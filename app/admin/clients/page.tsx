import Link from 'next/link';
import { Search, UserPlus } from 'lucide-react';
import { getAllClients, getAllRealtors } from '@/lib/db/admin';
import { StatusBadge } from '../_components/StatusBadge';
import { ExportButton } from '../_components/ExportButton';
import { ClientsTableClient } from './_components/ClientsTableClient';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await getAllClients();
  const realtors = await getAllRealtors();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage all clients in the system</p>
        </div>
        <div className="flex gap-3">
          <ExportButton data={clients} filename="clients" />
          <Link
            href="/admin/clients/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">New</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {clients.filter((c) => c.status === 'new').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Assigned</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {clients.filter((c) => c.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {clients.filter((c) => c.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <ClientsTableClient clients={clients} realtors={realtors} />
    </div>
  );
}

