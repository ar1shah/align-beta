'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../_components/Button';
import { Input } from '../_components/Input';
import { Card } from '../_components/Card';
import { Form } from '../_components/Form';
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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

        // Route based on role
        if (profile?.role === 'realtor') {
          router.push('/realtor');
        } else if (profile?.role === 'admin') {
          router.push('/dashboard');
        } else {
          // For new clients, always redirect to quiz first
          router.push('/quiz');
        }
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      // Note: This would require re-triggering signup or using resend functionality
      setResendMessage('Please check your spam folder or try signing up again.');
    } finally {
      setResendLoading(false);
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
          {/* Back to signup */}
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to signup
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Verify your email
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter the 6-digit code we sent to<br />
              <span className="font-medium text-foreground">{email || 'your email'}</span>
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

            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {resendMessage}
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
                label="Verification Code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                helperText="Check your email for the 6-digit code"
              />

              <Button type="submit" fullWidth disabled={loading || code.length !== 6} variant="brand">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Resend code
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
