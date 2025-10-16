'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.toLowerCase().includes('already') || 
            signUpError.message.toLowerCase().includes('exist')) {
          setError('An account with this email already exists. Please log in instead.');
          return;
        }
        throw signUpError;
      }

      // Redirect to OTP verification
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
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
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Get started with Align today
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
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
            />

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
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              required
              autoComplete="tel"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="At least 6 characters"
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
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

