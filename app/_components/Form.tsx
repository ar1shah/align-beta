'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ children, className = '', ...props }: FormProps) {
  return (
    <form className={cn('space-y-5', className)} {...props}>
      {children}
    </form>
  );
}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormField({ children, className = '', ...props }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, className = '', ...props }: FormLabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'error' | 'success' | 'warning';
}

export function FormMessage({ 
  children, 
  variant = 'error', 
  className = '', 
  ...props 
}: FormMessageProps) {
  const variantStyles = {
    error: 'text-destructive',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
  };

  return (
    <p
      className={cn('text-sm', variantStyles[variant], className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
}
