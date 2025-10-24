'use client';

import { Download } from 'lucide-react';
import { Button } from '@/app/_components/Button';

interface ExportButtonProps<T = Record<string, unknown>> {
  data: T[];
  filename: string;
  label?: string;
}

export function ExportButton<T = Record<string, unknown>>({ data, filename, label = 'Export CSV' }: ExportButtonProps<T>) {
  const handleExport = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0] as Record<string, unknown>);

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = (row as Record<string, unknown>)[header];
            // Handle nulls, arrays, objects
            if (value === null || value === undefined) return '';
            if (Array.isArray(value)) return `"${value.join(', ')}"`;
            if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
            // Escape quotes and wrap in quotes if contains comma
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      ),
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

