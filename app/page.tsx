'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from './_components/Button';

export default function Home() {
  // Check if env vars are missing
  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (envMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-soft-lg p-8 text-center border border-border/50"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Setup Required</h2>
          <p className="text-muted-foreground text-sm">
            Please configure your environment variables to get started.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient overflow-hidden relative">
      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl animate-float-slow animation-delay-500" />
      </div>

      {/* Main content - centered */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Blue Logo + Align text side by side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <Image 
              src="/bluelogo.svg" 
              alt="Align" 
              width={100} 
              height={51}
              priority
            />
            <h1 
              className="text-5xl sm:text-6xl font-bold"
              style={{ color: '#58748F' }}
            >
              Align
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground mb-10 max-w-md mx-auto"
          >
            Welcome to your real estate dashboard
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <Button variant="outline" size="xl" className="min-w-[160px]">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="brand" size="xl" className="min-w-[160px]">
                Sign Up
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
