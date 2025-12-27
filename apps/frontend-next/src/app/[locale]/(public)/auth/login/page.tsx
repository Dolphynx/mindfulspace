'use client';

/**
 * Login Page
 * Email/password login with OAuth options
 */

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import AuthDivider from '@/components/auth/AuthDivider';
import OAuthButtons from '@/components/auth/OAuthButtons';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split('/')[1] || 'en';
  const { login } = useAuth();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login({ email, password });
      const userRoles = userData?.user?.roles || [];

      // Helper function to check if user can access a path
      const canAccessPath = (path: string): boolean => {
        // Admin routes require admin role
        if (path.includes('/admin')) return userRoles.includes('admin');

        // Coach routes require coach or admin role
        if (path.includes('/coach')) return userRoles.includes('coach') || userRoles.includes('admin');

        // Resource creation/editing requires coach or admin role
        if (path.includes('/resources/new') || (path.includes('/resources/') && path.includes('/edit'))) {
          return userRoles.includes('coach') || userRoles.includes('admin');
        }

        // All other routes (/member/*, /resources/*, etc.) are accessible to authenticated users
        return true;
      };

      // Determine destination
      let destination: string;

      // Admin users always go to admin panel
      if (userRoles.includes('admin')) {
        destination = `/${locale}/admin`;
      } else {
        const redirectTo = searchParams.get('redirectTo');

        // Check if user can access the redirect destination
        if (redirectTo && canAccessPath(redirectTo)) {
          destination = redirectTo;
        } else {
          // Fall back to world-v2 if no valid redirectTo
          destination = `/${locale}/member/world-v2`;
        }
      }

      router.push(destination);
    } catch (err: any) {
      setError(err.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title={t('loginTitle')}
        subtitle={t('loginSubtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <AuthInput
            label={t('emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            required
            autoComplete="email"
          />

          <AuthInput
            label={t('passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end">
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs text-brandGreen hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <AuthButton type="submit" loading={loading}>
            {t('signInButton')}
          </AuthButton>
        </form>

        <AuthDivider text={t('orContinueWith')} />

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-brandText/70">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/auth/register`} className="font-medium text-brandGreen hover:underline">
            {t('signUpLink')}
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
