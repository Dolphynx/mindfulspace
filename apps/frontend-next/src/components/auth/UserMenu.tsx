'use client';

/**
 * UserMenu Component
 * Displays user avatar and dropdown menu when authenticated
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/i18n/TranslationContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const t = useTranslations('auth');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-brandBorder bg-white px-3 py-1.5 text-sm font-medium text-brandText transition hover:bg-brandSurface"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brandGreen text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="hidden md:inline">{user.displayName || 'User'}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-brandBorder bg-white shadow-lg z-50">
          <div className="border-b border-brandBorder px-4 py-3">
            <p className="text-sm font-medium text-brandText">{user.displayName}</p>
            <p className="text-xs text-brandText/70">{user.email}</p>
            {user.roles && user.roles.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-brandGreen/10 px-2 py-0.5 text-xs text-brandGreen"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="py-1">
            <Link
              href={`/${locale}/member/world-v2`}
              className="block px-4 py-2 text-sm text-brandText transition hover:bg-brandSurface"
              onClick={() => setIsOpen(false)}
            >
              {t('myWorld')}
            </Link>
            <Link
              href={`/${locale}/member/profile`}
              className="block px-4 py-2 text-sm text-brandText transition hover:bg-brandSurface"
              onClick={() => setIsOpen(false)}
            >
              {t('profileSettings')}
            </Link>
          </div>

          <div className="border-t border-brandBorder py-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
