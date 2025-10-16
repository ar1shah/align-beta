'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { unassignClient } from '../_actions';
import { Button } from '@/app/_components/Button';

interface UnassignDialogProps {
  clientId: string;
  clientName: string;
  realtorName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UnassignDialog({
  clientId,
  clientName,
  realtorName,
  onClose,
  onSuccess,
}: UnassignDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for unassigning');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await unassignClient(clientId, reason);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'Failed to unassign client');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Unassign Client</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You are about to unassign <strong>{clientName}</strong> from{' '}
              <strong>{realtorName}</strong>. This action will be logged in the audit trail.
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Unassignment *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
              placeholder="Client request, realtor capacity, etc."
              required
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
            <Button type="submit" disabled={isLoading} fullWidth>
              {isLoading ? 'Unassigning...' : 'Unassign Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

