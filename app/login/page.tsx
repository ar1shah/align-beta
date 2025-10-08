'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';

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
  } catch (error) {
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
        router.push('/dashboard'); // or /admin when built
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="text-3xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
          >
            Align
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600">
            Log in to access your dashboard
          </p>
        </div>

        <Card>
          {error && (
            <div
              className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
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
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

