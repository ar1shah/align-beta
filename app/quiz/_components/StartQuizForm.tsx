'use client';

import { useState } from 'react';
import { Button } from '@/app/_components/Button';
import { startQuizSession } from '../_actions';
import { useRouter } from 'next/navigation';
import { QuizSection } from '@/lib/quiz/types';

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
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}
      <Button
        fullWidth
        onClick={handleStart}
        disabled={isLoading}
        className="text-lg py-4"
      >
        {isLoading ? 'Starting...' : 'Start Quiz'}
      </Button>
    </div>
  );
}

