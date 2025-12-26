'use client';

/**
 * AdminDashboardShell Component
 *
 * WordPress-style admin dashboard shell with:
 * - Fixed left sidebar navigation
 * - Main content area that swaps without page reload (SPA-like)
 * - Sidebar menu items for different admin sections
 *
 * This component provides the layout structure for the admin panel.
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/i18n/TranslationContext';
import { LayoutDashboard, BookOpen, Activity, ArrowLeft, Tags, User } from 'lucide-react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

interface AdminDashboardShellProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'resources' | 'taxonomy' | 'profile';
  onTabChange: (tab: 'dashboard' | 'resources' | 'taxonomy' | 'profile') => void;
  locale: string;
}

export default function AdminDashboardShell({
  children,
  activeTab,
  onTabChange,
  locale,
}: AdminDashboardShellProps) {
  const t = useTranslations('adminDashboard');
  const pathname = usePathname();
  const currentLocale = locale || pathname.split('/')[1] || 'en';

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: t('tabs.dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'resources' as const,
      label: t('tabs.resources'),
      icon: BookOpen,
    },
    {
      id: 'taxonomy' as const,
      label: t('tabs.taxonomy'),
      icon: Tags,
    },
    {
      id: 'profile' as const,
      label: t('tabs.profile'),
      icon: User,
    },
  ];

  return (
    <div className="flex min-h-screen bg-brandBg text-brandText">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto border-r border-brandBorder bg-white">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b border-brandBorder px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-brandText">{t('title')}</h1>
                <p className="text-xs text-brandText/60">MindfulSpace</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-brandGreen/10 text-brandGreen border-l-4 border-brandGreen pl-2.5'
                        : 'text-brandText/70 hover:bg-brandSurface hover:text-brandText border-l-4 border-transparent pl-2.5'
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-brandGreen' : 'text-brandText/50 group-hover:text-brandText'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer - Back to App */}
          <div className="border-t border-brandBorder p-3">
            <Link
              href={`/${currentLocale}/member/world-v2`}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brandText/70 transition-all hover:bg-brandSurface hover:text-brandText"
            >
              <ArrowLeft className="h-5 w-5 text-brandText/50 transition-colors group-hover:text-brandText" />
              <span>{t('backToApp')}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen w-full">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
