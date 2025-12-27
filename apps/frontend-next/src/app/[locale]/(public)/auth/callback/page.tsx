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
        const userData = await refreshUser();
        const userRoles = userData?.roles || [];

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

        // Small delay to ensure state is updated
        setTimeout(() => {
          console.log('Redirecting to:', destination);
          router.push(destination);
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
