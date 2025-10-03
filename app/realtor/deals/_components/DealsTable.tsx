'use client';

import { useState } from 'react';
import { Deal } from '@/lib/db/deals';
import { PlusIcon, MapPinIcon, DollarSignIcon } from 'lucide-react';
import { CreateDealModal } from './CreateDealModal';

interface DealsTableProps {
  initialDeals: Deal[];
  realtorId: string;
}

export function DealsTable({ initialDeals, realtorId }: DealsTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deals] = useState<Deal[]>(initialDeals);

  const stageColors = {
    lead: 'bg-blue-100 text-blue-700',
    client: 'bg-purple-100 text-purple-700',
    under_contract: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Deal
        </button>
      </div>

      {deals.length > 0 ? (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deal.property_address || 'Untitled Deal'}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        stageColors[deal.stage]
                      }`}
                    >
                      {deal.stage.replace('_', ' ')}
                    </span>
                  </div>
                  {deal.side && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {deal.side === 'buy' ? 'Buy Side' : 'Listing'}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {deal.offer_price && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSignIcon className="w-4 h-4" />
                    <span>Offer: ${deal.offer_price.toLocaleString()}</span>
                  </div>
                )}
                {deal.close_date && (
                  <div className="text-gray-600">
                    Close: {new Date(deal.close_date).toLocaleDateString()}
                  </div>
                )}
                {deal.mls_link && (
                  <div className="col-span-2">
                    <a
                      href={deal.mls_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View MLS Listing →
                    </a>
                  </div>
                )}
              </div>

              {(deal.cda_storage_path || deal.hud_storage_path) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Documents:</p>
                  <div className="flex gap-2">
                    {deal.cda_storage_path && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        CDA Uploaded
                      </span>
                    )}
                    {deal.hud_storage_path && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        HUD Uploaded
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No deals yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first deal
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateDealModal
          realtorId={realtorId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}

