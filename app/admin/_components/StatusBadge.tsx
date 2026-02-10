'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

const statusConfig: Record<string, { bg: string; text: string; dot?: string }> = {
  // Client statuses
  new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  qualified: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  contacted: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  assigned: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  lost: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  
  // Quiz statuses
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  
  // Lead stages
  working: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  nurture: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  client: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  
  // Deal stages
  lead: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  under_contract: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  
  // Appointment statuses
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  confirmed: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  no_show: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  
  // Payout statuses
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  on_hold: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    bg: 'bg-slate-100', 
    text: 'text-slate-600',
    dot: 'bg-slate-400'
  };
  
  const formattedStatus = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {config.dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {formattedStatus}
    </span>
  );
}
