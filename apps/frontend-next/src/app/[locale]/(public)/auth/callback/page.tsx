'use client';

/**
 * OAuth Callback Page
 * Handles redirect after OAuth login (Google/GitHub)
 */

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';
import AuthCard from '@/components/auth/AuthCard';

export default function AuthCallbackPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const t = useTranslations('auth');
  const success = searchParams.get('success');
  const locale = pathname.split('/')[1] || 'en';
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      if (success === 'true') {
        console.log('OAuth success, refreshing user...');
        // OAuth was successful, refresh user data
        await refreshUser();

        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Redirecting to world...');
          router.push(`/${locale}/member/world`);
        }, 500);
      } else {
        // OAuth failed
        console.log('OAuth failed, redirecting to login...');
        setTimeout(() => {
          router.push(`/${locale}/auth/login`);
        }, 3000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <AuthCard title={success === 'true' ? t('signingIn') : t('authenticationFailed')}>
        <div className="flex justify-center py-8">
          {success === 'true' ? (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandGreen/20 border-t-brandGreen" />
          ) : (
            <p className="text-sm text-red-600">{t('redirectingToLogin')}</p>
          )}
        </div>
      </AuthCard>
    </div>
  );
}
