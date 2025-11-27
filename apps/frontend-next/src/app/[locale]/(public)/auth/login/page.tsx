'use client';

/**
 * Login Page
 * Email/password login with OAuth options
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
      await login({ email, password });
      router.push(`/${locale}/member/world`);
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
