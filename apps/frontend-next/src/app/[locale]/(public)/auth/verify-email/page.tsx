'use client';

/**
 * Email Verification Page
 * Verifies user email with token from URL
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { verifyEmail } from '@/lib/api/auth';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import { useTranslations } from '@/i18n/TranslationContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('auth');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts (React Strict Mode in dev)
    if (hasVerified.current) return;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(t('verifyEmailInvalidLink'));
      return;
    }

    hasVerified.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage(t('verifyEmailSuccessMessage'));
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || t('verifyEmailVerificationFailed'));
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard
        title={status === 'loading' ? t('verifyEmailLoading') : status === 'success' ? t('verifyEmailSuccess') : t('verifyEmailFailed')}
      >
        <div className="space-y-6 text-center">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandGreen/20 border-t-brandGreen" />
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brandGreen/10">
                <svg className="h-8 w-8 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-brandText/70">{message}</p>
              <p className="text-sm text-brandText/70">
                {t('verifyEmailCanSignIn')}
              </p>
              <AuthButton onClick={() => router.push(`/${locale}/auth/login`)}>
                {t('verifyEmailGoToLogin')}
              </AuthButton>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-600">{message}</p>
              <p className="text-sm text-brandText/70">
                {t('verifyEmailLinkExpired')}
              </p>
              <div className="space-y-2">
                <AuthButton onClick={() => router.push(`/${locale}/auth/register`)} variant="secondary">
                  {t('verifyEmailRegisterAgain')}
                </AuthButton>
                <AuthButton onClick={() => router.push(`/${locale}/auth/login`)} variant="ghost">
                  {t('backToLogin')}
                </AuthButton>
              </div>
            </>
          )}
        </div>
      </AuthCard>
    </div>
  );
}
