'use client';

import { Download } from 'lucide-react';

interface ExportQuizButtonProps {
  sessionId: string;
  responses: any[];
}

export function ExportQuizButton({ sessionId, responses }: ExportQuizButtonProps) {
  const handleExport = () => {
    const data = responses.map((r: any) => ({
      question: r.question?.prompt || 'Unknown',
      answer: JSON.stringify(r.value),
      type: r.question?.type,
    }));
    const csv = [
      'Question,Answer,Type',
      ...data.map((d) => `"${d.question}","${d.answer}","${d.type}"`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${sessionId}.csv`;
    a.click();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
