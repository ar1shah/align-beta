'use client';

import { ReactNode } from 'react';
import { Button } from '@/app/_components/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SectionLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export function SectionLayout({
  children,
  onBack,
  onNext,
  onSkip,
  canSkip = false,
  nextLabel = 'Continue',
  isNextDisabled = false,
}: SectionLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">{children}</div>
      </div>

      {/* Sticky footer with actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {onBack ? (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {canSkip && onSkip && (
                <Button variant="secondary" onClick={onSkip}>
                  Skip section
                </Button>
              )}
              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={isNextDisabled}
                  className="flex items-center gap-2"
                >
                  {nextLabel}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

