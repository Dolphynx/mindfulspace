'use client';

/**
 * Reset Password Page
 * Reset password with token from email
 */

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useTranslations } from '@/i18n/TranslationContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('auth');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('passwordMinLength');
    }
    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }
    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }
    if (!/[0-9]/.test(password)) {
      return t('passwordNumber');
    }
    if (!/[@$!%*?&]/.test(password)) {
      return t('passwordSpecial');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('resetPasswordInvalidLink'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard title={t('resetPasswordInvalidLink')}>
          <div className="space-y-4 text-center">
            <p className="text-sm text-red-600">{t('resetPasswordLinkExpired')}</p>
            <AuthButton onClick={() => router.push(`/${locale}/auth/forgot-password`)}>
              {t('resetPasswordRequestNew')}
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard title={t('resetPasswordComplete')}>
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
              <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-brandText/70">
              {t('resetPasswordSuccess')}
            </p>
            <AuthButton onClick={() => router.push(`/${locale}/auth/login`)}>
              {t('verifyEmailGoToLogin')}
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title={t('resetPasswordTitle')}
        subtitle={t('resetPasswordSubtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <AuthInput
            label={t('resetPasswordNewPasswordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            required
            autoComplete="new-password"
          />

          <AuthInput
            label={t('resetPasswordConfirmPasswordLabel')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            required
            autoComplete="new-password"
          />

          <p className="text-xs text-brandText/60">
            {t('passwordRequirements')}
          </p>

          <AuthButton type="submit" loading={loading}>
            {t('resetPasswordButton')}
          </AuthButton>
        </form>
      </AuthCard>
    </div>
  );
}
