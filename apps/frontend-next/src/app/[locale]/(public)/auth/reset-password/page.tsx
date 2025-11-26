'use client';

/**
 * Reset Password Page
 * Reset password with token from email
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain an uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain a lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain a number';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Password must contain a special character (@$!%*?&)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard title="Invalid Link">
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-600">The reset link is invalid or has expired.</p>
            <AuthButton onClick={() => router.push('/auth/forgot-password')}>
              Request New Link
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard title="Password Reset Complete">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
              <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-brandText/70">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <AuthButton onClick={() => router.push('/auth/login')}>
              Go to Login
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title="Reset Password"
        subtitle="Enter your new password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <AuthInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <AuthInput
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <p className="text-xs text-brandText/60">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
          </p>

          <AuthButton type="submit" loading={loading}>
            Reset Password
          </AuthButton>
        </form>
      </AuthCard>
    </div>
  );
}
