'use client';

/**
 * Forgot Password Page
 * Request password reset email
 */

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard
          title="Check Your Email"
          subtitle="Password reset instructions sent"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
              <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <p className="text-sm text-brandText/70">
              If an account exists with <strong className="text-brandText">{email}</strong>, you will receive password reset instructions.
            </p>

            <p className="text-xs text-brandText/60">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <div className="space-y-2">
              <AuthButton onClick={() => setSuccess(false)} variant="secondary">
                Try Another Email
              </AuthButton>
              <Link href="/auth/login">
                <AuthButton variant="ghost">
                  Back to Login
                </AuthButton>
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title="Forgot Password?"
        subtitle="Enter your email to receive reset instructions"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />

          <AuthButton type="submit" loading={loading}>
            Send Reset Link
          </AuthButton>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-brandGreen hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
