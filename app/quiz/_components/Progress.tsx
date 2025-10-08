'use client';

import { QuizSection } from '@/lib/quiz/types';
import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

interface ProgressProps {
  sections: QuizSection[];
  currentSectionKey: string;
  completionMap: Record<string, { answered: number; required: number }>;
}

export function Progress({
  sections,
  currentSectionKey,
  completionMap,
}: ProgressProps) {
  // Calculate overall progress
  const totalRequired = Object.values(completionMap).reduce(
    (sum, section) => sum + section.required,
    0
  );
  const totalAnswered = Object.values(completionMap).reduce(
    (sum, section) => sum + Math.min(section.answered, section.required),
    0
  );
  const progressPercent =
    totalRequired > 0 ? Math.round((totalAnswered / totalRequired) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="font-semibold text-primary-600">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">
          {totalAnswered} of {totalRequired} required questions answered
        </p>
      </div>

      {/* Section chips */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const completion = completionMap[section.key] || {
            answered: 0,
            required: 0,
          };
          const isComplete =
            completion.required === 0 ||
            completion.answered >= completion.required;
          const isCurrent = section.key === currentSectionKey;

          return (
            <Link
              key={section.key}
              href={`/quiz/${section.key}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-primary-600 text-white shadow-md'
                  : isComplete
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>{section.title}</span>
              {!section.is_optional && (
                <span className="text-xs opacity-75">(required)</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

