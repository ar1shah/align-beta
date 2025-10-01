'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://www.app.alignagentsre.com';

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
            Reset your password
          </h1>
          <p className="mt-2 text-gray-600">
            We'll send you a link to reset your password
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

          {success && (
            <div
              className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl"
              role="alert"
              aria-live="polite"
            >
              Check your email! We've sent you a password reset link.
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

            <Button type="submit" fullWidth disabled={loading || success}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

