'use client';

/**
 * Email Verification Redirect Handler
 * This page exists at /auth/verify-email (without locale) to handle email verification links.
 * It immediately redirects to the proper localized verification page.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get the current query params (should include the token)
    const params = new URLSearchParams(window.location.search);

    // Detect user's preferred locale from browser or use default
    const browserLocale = navigator.language.split('-')[0];
    const locale = ['en', 'fr'].includes(browserLocale) ? browserLocale : 'fr';

    // Redirect to localized verification page with query params
    const queryString = params.toString();
    const redirectUrl = `/${locale}/auth/verify-email${queryString ? `?${queryString}` : ''}`;

    router.replace(redirectUrl);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brandSurface">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brandGreen border-t-transparent mx-auto" />
        <p className="text-sm text-brandText">Redirecting...</p>
      </div>
    </div>
  );
}
