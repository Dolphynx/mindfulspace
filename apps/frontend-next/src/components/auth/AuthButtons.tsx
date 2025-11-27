'use client';

/**
 * AuthButtons Component
 * Displays login/register buttons when not authenticated
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';
import UserMenu from './UserMenu';

export default function AuthButtons() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('auth');

  if (loading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-lg bg-brandBorder" />
    );
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/auth/login`}
        className="rounded-lg border border-brandBorder bg-white px-4 py-2 text-sm font-medium text-brandText transition hover:bg-brandSurface"
      >
        {t('signIn')}
      </Link>
      <Link
        href={`/${locale}/auth/register`}
        className="rounded-lg border border-brandGreen bg-brandGreen px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brandGreen/90"
      >
        {t('signUp')}
      </Link>
    </div>
  );
}
