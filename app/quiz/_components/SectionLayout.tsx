'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <Image 
              src="/alignicon.png" 
              alt="Align" 
              width={36} 
              height={36}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-xl font-bold gradient-text">Align</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">{children}</div>
      </div>

      {/* Sticky footer with actions */}
      <div className="relative z-10 sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-border/50 shadow-soft">
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
                <Button variant="ghost" onClick={onSkip}>
                  Skip section
                </Button>
              )}
              {onNext && (
                <Button
                  variant="brand"
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
