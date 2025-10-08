'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QuizSection, QuizQuestion, QuizResponse, QuizValue } from '@/lib/quiz/types';
import { Question } from './Question';
import { Progress } from './Progress';
import { SectionLayout } from './SectionLayout';
import { upsertQuizResponse, completeQuizSession } from '../_actions';

interface SectionFormProps {
  section: QuizSection;
  questions: QuizQuestion[];
  responses: QuizResponse[];
  sessionId: string;
  sections: QuizSection[];
  completionMap: Record<string, { answered: number; required: number }>;
  prevSectionKey?: string;
  nextSectionKey?: string;
  isLastSection: boolean;
}

export function SectionForm({
  section,
  questions,
  responses,
  sessionId,
  sections,
  completionMap,
  prevSectionKey,
  nextSectionKey,
  isLastSection,
}: SectionFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Build response map
  const responseMap = useMemo(() => {
    const map: Record<string, QuizValue> = {};
    for (const response of responses) {
      map[response.question_id] = response.value;
    }
    return map;
  }, [responses]);

  // Handle answer change with autosave
  const handleAnswerChange = async (questionId: string, value: QuizValue) => {
    try {
      await upsertQuizResponse(sessionId, questionId, value);
      // Clear error for this question if it exists
      if (errors[questionId]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[questionId];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  // Validate required questions
  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const question of questions) {
      if (question.required && !responseMap[question.id]) {
        newErrors[question.id] = 'This question is required';
        isValid = false;
      }

      // Special validation for consent (yes_no type)
      if (question.key === 'consent' && responseMap[question.id]) {
        const value = responseMap[question.id];
        if ('value' in value && value.value !== true) {
          newErrors[question.id] = 'You must agree to be contacted to continue';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    // Validate required fields
    if (!validateSection()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-has-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSaving(true);

    // If this is the last section (contact), complete the session
    if (isLastSection) {
      const result = await completeQuizSession(sessionId);
      if (result.success) {
        router.push('/quiz/complete');
      } else {
        alert('Error completing quiz. Please try again.');
      }
      setIsSaving(false);
      return;
    }

    // Navigate to next section
    if (nextSectionKey) {
      router.push(`/quiz/${nextSectionKey}`);
    } else {
      // No more sections, go to complete
      const result = await completeQuizSession(sessionId);
      if (result.success) {
        router.push('/quiz/complete');
      }
    }

    setIsSaving(false);
  };

  const handleBack = () => {
    if (prevSectionKey) {
      router.push(`/quiz/${prevSectionKey}`);
    } else {
      router.push('/quiz');
    }
  };

  const handleSkip = () => {
    if (nextSectionKey) {
      router.push(`/quiz/${nextSectionKey}`);
    } else {
      // Find contact section
      const contactSection = sections.find((s) => s.key === 'contact');
      if (contactSection) {
        router.push(`/quiz/${contactSection.key}`);
      }
    }
  };

  return (
    <SectionLayout
      onBack={handleBack}
      onNext={handleNext}
      onSkip={section.is_optional ? handleSkip : undefined}
      canSkip={section.is_optional}
      nextLabel={isLastSection ? 'Submit' : 'Continue'}
      isNextDisabled={isSaving}
    >
      <div className="space-y-8">
        {/* Progress indicator */}
        <Progress
          sections={sections}
          currentSectionKey={section.key}
          completionMap={completionMap}
        />

        {/* Section header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {section.title}
          </h1>
          {section.description && (
            <p className="text-gray-600">{section.description}</p>
          )}
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          {questions.map((question) => (
            <div
              key={question.id}
              data-has-error={!!errors[question.id]}
              className="pb-8 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <Question
                question={question}
                value={responseMap[question.id] || null}
                onChange={(value) => handleAnswerChange(question.id, value)}
                error={errors[question.id]}
              />
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No questions in this section based on your previous answers.</p>
            </div>
          )}
        </div>
      </div>
    </SectionLayout>
  );
}

