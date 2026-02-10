'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';
import { ArrowLeft, Loader2, Lock, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if we have a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setIsChecking(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Success - redirect to login
      router.push('/login?message=Password updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {/* Back to login */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
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
              Set new password
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose a strong password for your account
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
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {isValidSession ? (
              <Form onSubmit={handleSubmit}>
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  helperText="At least 6 characters"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />

                <Button type="submit" fullWidth disabled={loading} variant="brand">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </Form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Link Expired</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  This password reset link has expired or is invalid.
                </p>
                <Link href="/forgot-password">
                  <Button variant="brand" fullWidth>
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
