'use client';

import { useState } from 'react';
import { Button } from '@/app/_components/Button';
import { startQuizSession } from '../_actions';
import { useRouter } from 'next/navigation';
import { QuizSection } from '@/lib/quiz/types';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface StartQuizFormProps {
  sections: QuizSection[];
}

export function StartQuizForm({ sections }: StartQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await startQuizSession('initial', []);

      if (result.success) {
        // Redirect to first section (entry)
        const firstSection = sections[0];
        if (firstSection) {
          router.push(`/quiz/${firstSection.key}`);
        }
      } else {
        setError(result.error || 'Failed to start quiz');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <Button
        fullWidth
        variant="brand"
        onClick={handleStart}
        disabled={isLoading}
        size="xl"
        className="group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            Start Quiz
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Takes about 2-3 minutes to complete
      </p>
    </div>
  );
}
