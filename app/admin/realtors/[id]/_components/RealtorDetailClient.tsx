'use client';

import { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Realtor } from '@/lib/db/admin';
import { updateRealtorCapacity, toggleRealtorActive } from '../../../_actions';
import { Button } from '@/app/_components/Button';

interface RealtorDetailClientProps {
  realtor: Realtor;
}

export function RealtorDetailClient({ realtor }: RealtorDetailClientProps) {
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [capacity, setCapacity] = useState(realtor.capacity.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveCapacity = async () => {
    const newCapacity = parseInt(capacity, 10);
    if (isNaN(newCapacity) || newCapacity < 0) {
      setError('Please enter a valid capacity');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await updateRealtorCapacity(realtor.id, newCapacity);

    if (result.success) {
      setIsEditingCapacity(false);
      window.location.reload();
    } else {
      setError(result.error || 'Failed to update capacity');
    }

    setIsLoading(false);
  };

  const handleToggleActive = async () => {
    setIsLoading(true);
    setError('');

    const result = await toggleRealtorActive(realtor.id, !realtor.active);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || 'Failed to update status');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Actions</h2>

      {/* Edit Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capacity
        </label>
        {isEditingCapacity ? (
          <div className="space-y-2">
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSaveCapacity}
                disabled={isLoading}
                fullWidth
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingCapacity(false);
                  setCapacity(realtor.capacity.toString());
                  setError('');
                }}
                disabled={isLoading}
                fullWidth
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsEditingCapacity(true)}
            fullWidth
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Capacity
          </Button>
        )}
      </div>

      {/* Toggle Active */}
      <div>
        <Button
          variant={realtor.active ? 'outline' : 'primary'}
          onClick={handleToggleActive}
          disabled={isLoading}
          fullWidth
        >
          {realtor.active ? 'Deactivate' : 'Activate'} Realtor
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

