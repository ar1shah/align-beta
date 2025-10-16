'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { assignClientToRealtor } from '../_actions';
import { Realtor } from '@/lib/db/admin';
import { Button } from '@/app/_components/Button';

interface AssignClientDialogProps {
  clientId: string;
  clientName: string;
  realtors: Realtor[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignClientDialog({
  clientId,
  clientName,
  realtors,
  onClose,
  onSuccess,
}: AssignClientDialogProps) {
  const [selectedRealtorId, setSelectedRealtorId] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const activeRealtors = realtors.filter((r) => r.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRealtorId) {
      setError('Please select a realtor');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await assignClientToRealtor(clientId, selectedRealtorId, reason || undefined);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'Failed to assign client');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Assign Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">
              {clientName}
            </div>
          </div>

          <div>
            <label htmlFor="realtor" className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Realtor *
            </label>
            <select
              id="realtor"
              value={selectedRealtorId}
              onChange={(e) => setSelectedRealtorId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              required
            >
              <option value="">Select a realtor...</option>
              {activeRealtors.map((realtor) => (
                <option key={realtor.id} value={realtor.id}>
                  {realtor.full_name} - {realtor.email}
                </option>
              ))}
            </select>
            {activeRealtors.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No active realtors available</p>
            )}
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
              placeholder="Initial assignment, reassignment, etc."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || activeRealtors.length === 0} fullWidth>
              {isLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

