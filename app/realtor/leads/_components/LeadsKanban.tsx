'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Lead, LeadStage } from '@/lib/db/leads';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { createClient } from '@/lib/supabaseClient';

interface LeadsKanbanProps {
  initialLeads: Lead[];
  realtorId: string;
}

const stages: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { id: 'working', label: 'Working', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'nurture', label: 'Nurture', color: 'bg-purple-100 text-purple-700' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-100 text-gray-700' },
];

export function LeadsKanban({ initialLeads, realtorId }: LeadsKanbanProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('realtor-leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `assigned_realtor_id=eq.${realtorId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads((prev) => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((lead) =>
                lead.id === payload.new.id ? (payload.new as Lead) : lead
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLeads((prev) => prev.filter((lead) => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtorId]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStage;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );

    // Update server
    try {
      const res = await fetch('/api/realtor/leads/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, stage: newStage }),
      });

      if (!res.ok) {
        // Revert on error
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? lead : l))
        );
      }
    } catch (error) {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? lead : l))
      );
    }
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter((l) => l.stage === stage.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

