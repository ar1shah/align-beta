'use client';

import { QuizResponse } from '@/lib/db/admin';

interface QuizAnswerViewerProps {
  responses: (QuizResponse & { question?: any })[];
}

export function QuizAnswerViewer({ responses }: QuizAnswerViewerProps) {
  const formatValue = (value: any, questionType?: string) => {
    if (!value) return 'No answer';

    // Handle different value structures
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value.value !== undefined) {
      // Single value response
      if (typeof value.value === 'boolean') {
        return value.value ? 'Yes' : 'No';
      }
      return String(value.value);
    }

    if (value.values) {
      // Multi-choice response
      const vals = Array.isArray(value.values) ? value.values : [value.values];
      return vals.join(', ');
    }

    if (questionType === 'address') {
      // Address response
      const parts = [
        value.line1,
        value.line2,
        value.city,
        value.state,
        value.postal_code,
      ].filter(Boolean);
      return parts.join(', ') || 'No address provided';
    }

    // Fallback to JSON
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="space-y-6">
      {responses.map((response: any, index) => {
        const question = response.question;
        const questionType = question?.type;

        return (
          <div
            key={response.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-blue-700">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {question?.prompt || 'Unknown Question'}
                  </h3>
                  {questionType && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium whitespace-nowrap">
                      {questionType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                
                {question?.help_text && (
                  <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
                )}

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Answer:</p>
                  <div className="text-sm text-gray-900">
                    {questionType === 'long_text' ? (
                      <p className="whitespace-pre-wrap">{formatValue(response.value, questionType)}</p>
                    ) : questionType === 'address' ? (
                      <div className="space-y-1">
                        {response.value.line1 && <p>{response.value.line1}</p>}
                        {response.value.line2 && <p>{response.value.line2}</p>}
                        {(response.value.city || response.value.state || response.value.postal_code) && (
                          <p>
                            {[response.value.city, response.value.state, response.value.postal_code]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    ) : typeof response.value === 'object' && 
                       !response.value.value && 
                       !response.value.values ? (
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(response.value, null, 2)}
                      </pre>
                    ) : (
                      <p>{formatValue(response.value, questionType)}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Answered: {new Date(response.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

