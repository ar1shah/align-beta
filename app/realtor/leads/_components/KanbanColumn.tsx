'use client';

import { useDroppable } from '@dnd-kit/core';
import { Lead, LeadStage } from '@/lib/db/leads';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  stage: { id: LeadStage; label: string; color: string };
  leads: Lead[];
}

const stageColors: Record<string, { bg: string; badge: string }> = {
  new: { bg: 'from-blue-50/80 to-blue-100/50', badge: 'bg-blue-100 text-blue-700' },
  working: { bg: 'from-amber-50/80 to-amber-100/50', badge: 'bg-amber-100 text-amber-700' },
  nurture: { bg: 'from-purple-50/80 to-purple-100/50', badge: 'bg-purple-100 text-purple-700' },
  lost: { bg: 'from-slate-50/80 to-slate-100/50', badge: 'bg-slate-100 text-slate-600' },
};

export function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const colors = stageColors[stage.id] || stageColors.new;

  return (
    <div 
      className={cn(
        'rounded-xl p-4 min-h-[600px] transition-all duration-200 border border-border/30',
        `bg-gradient-to-b ${colors.bg}`,
        isOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10">
        <h3 className="font-semibold text-foreground">{stage.label}</h3>
        <span
          className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            colors.badge
          )}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards container */}
      <div ref={setNodeRef} className="space-y-3">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LeadCard lead={lead} />
          </div>
        ))}
        
        {/* Empty state */}
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No leads in this stage
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Drag leads here to update their status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
