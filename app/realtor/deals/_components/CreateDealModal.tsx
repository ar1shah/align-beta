'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon } from 'lucide-react';

interface CreateDealModalProps {
  realtorId: string;
  onClose: () => void;
}

export function CreateDealModal({ realtorId, onClose }: CreateDealModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_address: '',
    mls_link: '',
    offer_price: '',
    side: '',
    stage: 'lead',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/realtor/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          realtor_id: realtorId,
          offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create deal');

      router.refresh();
      onClose();
    } catch (error) {
      alert('Failed to create deal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">New Deal</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Address
            </label>
            <input
              type="text"
              value={formData.property_address}
              onChange={(e) =>
                setFormData({ ...formData, property_address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side
            </label>
            <select
              value={formData.side}
              onChange={(e) => setFormData({ ...formData, side: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="buy">Buy Side</option>
              <option value="listing">Listing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offer Price
            </label>
            <input
              type="number"
              value={formData.offer_price}
              onChange={(e) =>
                setFormData({ ...formData, offer_price: e.target.value })
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MLS Link
            </label>
            <input
              type="url"
              value={formData.mls_link}
              onChange={(e) =>
                setFormData({ ...formData, mls_link: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

