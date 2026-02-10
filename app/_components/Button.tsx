'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'brand';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]'
  );

  const variantStyles = {
    primary: cn(
      'bg-primary text-primary-foreground shadow-sm',
      'hover:bg-primary/90 hover:shadow-md'
    ),
    secondary: cn(
      'bg-secondary text-secondary-foreground shadow-sm',
      'hover:bg-secondary/80'
    ),
    outline: cn(
      'border border-input bg-background shadow-sm',
      'hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
    ),
    ghost: cn(
      'hover:bg-accent hover:text-accent-foreground'
    ),
    destructive: cn(
      'bg-destructive text-destructive-foreground shadow-sm',
      'hover:bg-destructive/90'
    ),
    brand: cn(
      'bg-gradient-brand text-white shadow-md',
      'hover:shadow-lg hover:shadow-brand-500/25'
    ),
  };

  const sizeStyles = {
    default: 'h-10 px-5 py-2 text-sm',
    sm: 'h-9 px-3 text-xs rounded-md',
    lg: 'h-11 px-8 text-sm',
    xl: 'h-12 px-10 text-base rounded-xl',
    icon: 'h-10 w-10',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
