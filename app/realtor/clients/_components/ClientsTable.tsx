'use client';

import { useState } from 'react';
import { CrmClient } from '@/lib/db/clients';
import { PlusIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { CreateClientModal } from './CreateClientModal';

interface ClientsTableProps {
  initialClients: CrmClient[];
  realtorId: string;
}

export function ClientsTable({ initialClients, realtorId }: ClientsTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients] = useState<CrmClient[]>(initialClients);

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    under_contract: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {clients.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {client.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MailIcon className="w-4 h-4" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {client.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.timeline || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[client.status]
                        }`}
                      >
                        {client.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No clients yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first client
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateClientModal
          realtorId={realtorId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}

