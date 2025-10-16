'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Client, Realtor } from '@/lib/db/admin';
import { assignClientToRealtor } from '../../_actions';
import { Button } from '@/app/_components/Button';
import { StatusBadge } from '../../_components/StatusBadge';

interface RealtorWithLoad extends Realtor {
  assigned: number;
  available: number;
  utilization: number;
}

interface AssignmentsClientProps {
  unassignedClients: Client[];
  realtors: RealtorWithLoad[];
}

export function AssignmentsClient({ unassignedClients, realtors }: AssignmentsClientProps) {
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [selectedRealtor, setSelectedRealtor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClients.size === unassignedClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(unassignedClients.map((c) => c.id)));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedRealtor || selectedClients.size === 0) {
      setMessage({ type: 'error', text: 'Please select clients and a realtor' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const clientIds = Array.from(selectedClients);
    let successCount = 0;
    let failCount = 0;

    for (const clientId of clientIds) {
      const result = await assignClientToRealtor(clientId, selectedRealtor, 'Bulk assignment');
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsLoading(false);
    setSelectedClients(new Set());
    setSelectedRealtor('');

    if (failCount === 0) {
      setMessage({ 
        type: 'success', 
        text: `Successfully assigned ${successCount} client${successCount !== 1 ? 's' : ''}` 
      });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setMessage({ 
        type: 'error', 
        text: `Assigned ${successCount}, failed ${failCount}` 
      });
    }
  };

  // Get recommended realtor (most available capacity)
  const recommendedRealtor = realtors.length > 0 ? realtors[0] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Assignment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select clients and assign them to a realtor
          </p>
        </div>
        {recommendedRealtor && selectedClients.size > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Recommended: </span>
            <button
              onClick={() => setSelectedRealtor(recommendedRealtor.id)}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              {recommendedRealtor.full_name} ({recommendedRealtor.available} available)
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {unassignedClients.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Realtor
              </label>
              <select
                value={selectedRealtor}
                onChange={(e) => setSelectedRealtor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Choose a realtor...</option>
                {realtors.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} - {r.available} available ({r.utilization}% used)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleBulkAssign}
                disabled={isLoading || selectedClients.size === 0 || !selectedRealtor}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign {selectedClients.size > 0 && `(${selectedClients.size})`}
              </Button>
            </div>
          </div>
          {selectedClients.size > 0 && (
            <p className="text-sm text-blue-700 mt-2">
              {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Unassigned Clients List */}
      {unassignedClients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">All clients are assigned! 🎉</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Unassigned Clients ({unassignedClients.length})
            </h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedClients.size === unassignedClients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unassignedClients.map((client) => (
              <div
                key={client.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedClients.has(client.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleClient(client.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedClients.has(client.id)}
                    onChange={() => handleToggleClient(client.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

