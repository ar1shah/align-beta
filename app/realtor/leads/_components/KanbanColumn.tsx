import { useDroppable } from '@dnd-kit/core';
import { Lead, LeadStage } from '@/lib/db/leads';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  stage: { id: LeadStage; label: string; color: string };
  leads: Lead[];
}

export function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="bg-gray-50 rounded-xl p-4 min-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${stage.color}`}
        >
          {leads.length}
        </span>
      </div>

      <div ref={setNodeRef} className="space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No leads in this stage
          </p>
        )}
      </div>
    </div>
  );
}

