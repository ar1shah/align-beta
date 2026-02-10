'use client';

import { 
  UsersIcon, 
  UserXIcon, 
  UserCheckIcon, 
  TrendingUpIcon,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  users: UsersIcon,
  'user-x': UserXIcon,
  'user-check': UserCheckIcon,
  'trending-up': TrendingUpIcon,
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon: keyof typeof iconMap;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'gradient';
}

export function KPICard({ 
  title, 
  value, 
  icon, 
  trend, 
  className = '',
  variant = 'default'
}: KPICardProps) {
  const Icon = iconMap[icon];
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 p-6 transition-all duration-300',
        'hover:shadow-soft-lg hover:-translate-y-0.5',
        'bg-card',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div 
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-500'
              )}
            >
              <svg
                className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {trend.isPositive ? '+' : ''}{trend.value}%
              <span className="text-muted-foreground font-normal">vs last week</span>
            </div>
          )}
        </div>
        <div 
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200',
            variant === 'gradient' 
              ? 'bg-gradient-brand shadow-lg shadow-brand-500/25' 
              : 'bg-primary/10'
          )}
        >
          <Icon 
            className={cn(
              'h-6 w-6',
              variant === 'gradient' ? 'text-white' : 'text-primary'
            )} 
          />
        </div>
      </div>
    </div>
  );
}
