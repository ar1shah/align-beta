'use client';

import { useDraggable } from '@dnd-kit/core';
import { Lead } from '@/lib/db/leads';
import {
  MailIcon,
  PhoneIcon,
  DollarSignIcon,
  MapPinIcon,
  CalendarIcon,
  MoreVerticalIcon,
  GripVertical,
} from 'lucide-react';
import { LeadActions } from './LeadActions';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
        className={cn(
          'group bg-card rounded-xl border border-border/50 p-4 cursor-grab active:cursor-grabbing transition-all duration-200',
          'hover:shadow-soft-lg hover:border-border hover:-translate-y-0.5',
          isDragging && 'opacity-50 shadow-soft-lg rotate-2'
        )}
      >
        {/* Drag handle and header */}
        <div className="flex items-start gap-2 mb-3">
          <div
            {...listeners}
            {...attributes}
            className="mt-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground truncate">{lead.full_name}</h4>
                {lead.buyer_or_seller && (
                  <span className={cn(
                    'inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full',
                    lead.buyer_or_seller === 'buyer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-violet-100 text-violet-700'
                  )}>
                    {lead.buyer_or_seller === 'buyer' ? 'Buyer' : 'Seller'}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(true);
                }}
                className="p-1.5 hover:bg-accent rounded-lg transition-colors -mr-1"
              >
                <MoreVerticalIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2 text-sm">
          {lead.email && (
            <a 
              href={`mailto:${lead.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MailIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </a>
          )}
          {lead.phone && (
            <a 
              href={`tel:${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <PhoneIcon className="w-4 h-4 flex-shrink-0" />
              <span>{lead.phone}</span>
            </a>
          )}
          {lead.price_target && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSignIcon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-foreground">${lead.price_target.toLocaleString()}</span>
            </div>
          )}
          {lead.area_pref && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{lead.area_pref}</span>
            </div>
          )}
        </div>

        {/* Next step */}
        {lead.next_step && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next Step</p>
            <p className="text-sm text-foreground mt-1">{lead.next_step}</p>
          </div>
        )}

        {/* Follow up date */}
        {lead.next_touch_at && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700">
              <CalendarIcon className="w-3 h-3" />
              Follow up: {new Date(lead.next_touch_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Source */}
        {lead.lead_source && (
          <div className="mt-2 text-xs text-muted-foreground">
            Source: <span className="text-foreground">{lead.lead_source}</span>
          </div>
        )}
      </div>

      {showActions && (
        <LeadActions lead={lead} onClose={() => setShowActions(false)} />
      )}
    </>
  );
}
