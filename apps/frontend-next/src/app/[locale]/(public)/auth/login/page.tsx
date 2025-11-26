'use client';

/**
 * Login Page
 * Email/password login with OAuth options
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthDivider from '@/components/auth/AuthDivider';
import OAuthButtons from '@/components/auth/OAuthButtons';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/member/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to your MindfulSpace account"
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

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-brandGreen hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" loading={loading}>
            Sign In
          </AuthButton>
        </form>

        <AuthDivider text="or continue with" />

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-brandText/70">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-brandGreen hover:underline">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
