'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-card shadow-soft border border-border',
    elevated: 'bg-card shadow-soft-lg border border-border',
    interactive: 'bg-card shadow-soft border border-border card-interactive',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  );
}
