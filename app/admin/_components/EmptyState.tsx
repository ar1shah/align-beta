'use client';

import { 
  UserCheckIcon, 
  ClipboardList,
  Users,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'user-check': UserCheckIcon,
  'clipboard-list': ClipboardList,
  'users': Users,
};

interface EmptyStateProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  const Icon = iconMap[icon];
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}
