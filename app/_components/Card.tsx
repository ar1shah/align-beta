import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 ${className}`}
    >
      {children}
    </div>
  );
}

