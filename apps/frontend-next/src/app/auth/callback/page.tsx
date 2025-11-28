'use client';

/**
 * OAuth Callback Redirect Handler
 * This page exists at /auth/callback (without locale) to handle OAuth redirects from the backend.
 * It immediately redirects to the proper localized callback page.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthCallbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get the current query params
    const params = new URLSearchParams(window.location.search);

    // Detect user's preferred locale from browser or use default
    const browserLocale = navigator.language.split('-')[0];
    const locale = ['en', 'fr'].includes(browserLocale) ? browserLocale : 'en';

    // Redirect to localized callback page with query params
    const queryString = params.toString();
    const redirectUrl = `/${locale}/auth/callback${queryString ? `?${queryString}` : ''}`;

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
