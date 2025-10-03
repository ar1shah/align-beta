import { useDraggable } from '@dnd-kit/core';
import { Lead } from '@/lib/db/leads';
import {
  MailIcon,
  PhoneIcon,
  DollarSignIcon,
  MapPinIcon,
  CalendarIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { LeadActions } from './LeadActions';
import { useState } from 'react';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

export function LeadCard({ lead, isDragging = false }: LeadCardProps) {
  const [showActions, setShowActions] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`bg-white rounded-lg border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{lead.full_name}</h4>
            {lead.buyer_or_seller && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {lead.buyer_or_seller === 'buyer' ? 'Buyer' : 'Seller'}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVerticalIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {lead.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <MailIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <PhoneIcon className="w-4 h-4 flex-shrink-0" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.price_target && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSignIcon className="w-4 h-4 flex-shrink-0" />
              <span>${lead.price_target.toLocaleString()}</span>
            </div>
          )}
          {lead.area_pref && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{lead.area_pref}</span>
            </div>
          )}
        </div>

        {lead.next_step && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Next Step:</p>
            <p className="text-sm text-gray-900 mt-1">{lead.next_step}</p>
          </div>
        )}

        {lead.next_touch_at && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <CalendarIcon className="w-3 h-3" />
            Follow up: {new Date(lead.next_touch_at).toLocaleDateString()}
          </div>
        )}

        {lead.lead_source && (
          <div className="mt-2 text-xs text-gray-500">
            Source: {lead.lead_source}
          </div>
        )}
      </div>

      {showActions && (
        <LeadActions lead={lead} onClose={() => setShowActions(false)} />
      )}
    </>
  );
}

