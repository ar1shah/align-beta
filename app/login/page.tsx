'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Helper function to check if user has completed quiz
async function checkQuizCompletion(userId: string): Promise<boolean> {
  try {
    const { data: session } = await supabase
      .from('quiz_sessions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(1)
      .single();

    return Boolean(session);
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Route based on role
      if (profile?.role === 'realtor') {
        router.push('/realtor');
      } else if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        // For clients, check if they've completed the quiz
        const hasCompletedQuiz = await checkQuizCompletion(data.user.id);
        if (hasCompletedQuiz) {
          router.push('/dashboard');
        } else {
          router.push('/quiz');
        }
      }
      
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Back to home */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8 group">
              <Image 
                src="/bluelogo.svg" 
                alt="Align" 
                width={56} 
                height={28}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-4xl font-bold" style={{ color: '#58748F' }}>Align</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Log in to access your dashboard
            </p>
          </div>

          <Card variant="elevated" className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </motion.div>
            )}

            <Form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" fullWidth disabled={loading} variant="brand">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </Form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
