interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-purple-100 text-purple-800',
  active: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-800',
  lost: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

