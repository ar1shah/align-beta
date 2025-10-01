'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      // Check if profile exists, create if needed (fallback)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // Fallback: create profile if trigger didn't work
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.user_metadata.full_name || null,
            phone: user.user_metadata.phone || null,
            role: 'client',
          });
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
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
            Verify your email
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code we sent to your email
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
              label="Verification Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              helperText="Check your email for the 6-digit code"
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={() => setError('Please check your spam folder or try signing up again.')}
              className="text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              Resend
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}

