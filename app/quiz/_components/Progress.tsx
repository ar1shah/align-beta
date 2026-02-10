'use client';

import { QuizSection } from '@/lib/quiz/types';
import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
          <span className="font-medium text-foreground">Overall Progress</span>
          <span className="font-semibold text-primary">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
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
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isCurrent
                  ? 'bg-gradient-brand text-white shadow-md shadow-brand-500/25'
                  : isComplete
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span>{section.title}</span>
              {!section.is_optional && !isComplete && (
                <span className="text-xs opacity-75">(required)</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
