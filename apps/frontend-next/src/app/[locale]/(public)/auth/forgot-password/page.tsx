'use client';

/**
 * Forgot Password Page
 * Request password reset email
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api/auth';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useTranslations } from '@/i18n/TranslationContext';

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('auth');
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
      setError(err.message || t('forgotPasswordFailedToSend'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AuthCard
          title={t('forgotPasswordCheckEmail')}
          subtitle={t('forgotPasswordInstructionsSent')}
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
              <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <p className="text-sm text-brandText/70">
              {t('forgotPasswordCheckEmailMessage').split('{email}')[0]}
              <strong className="text-brandText">{email}</strong>
              {t('forgotPasswordCheckEmailMessage').split('{email}')[1]}
            </p>

            <p className="text-xs text-brandText/60">
              {t('forgotPasswordCheckSpam')}
            </p>

            <div className="space-y-2">
              <AuthButton onClick={() => setSuccess(false)} variant="secondary">
                {t('forgotPasswordTryAnother')}
              </AuthButton>
              <Link href={`/${locale}/auth/login`}>
                <AuthButton variant="ghost">
                  {t('backToLogin')}
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
        title={t('forgotPasswordTitle')}
        subtitle={t('forgotPasswordSubtitle')}
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

          <AuthButton type="submit" loading={loading}>
            {t('forgotPasswordSendButton')}
          </AuthButton>

          <div className="text-center">
            <Link href={`/${locale}/auth/login`} className="text-sm text-brandGreen hover:underline">
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
