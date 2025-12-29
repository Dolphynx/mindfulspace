"use client";

/**
 * Admin Dashboard - Main Page
 *
 * WordPress-style admin interface with SPA tab navigation:
 * - Dashboard: Overview and statistics
 * - Resources: Resource management
 * - Taxonomy: Categories and tags management
 * - Sessions: Meditation session management
 *
 * Route: /[locale]/admin
 */

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";
import AdminDashboardShell from "@/components/admin/AdminDashboardShell";
import { ResourcesList } from "@/components/resources";
import { useTranslations } from "@/i18n/TranslationContext";
import dynamic from "next/dynamic";
import { getDashboardStatistics, DashboardStatistics } from "@/lib/api/admin";

// Dynamically import the taxonomy content (without the shell wrapper)
const TaxonomyContent = dynamic(
    () => import("./taxonomy/TaxonomyContent"),
    { ssr: false, loading: () => <div className="flex h-64 items-center justify-center"><p className="text-brandText/60">Loading...</p></div> }
);

// Dynamically import the profile content
const ProfileContent = dynamic(
    () => import("@/components/profile/ProfileContent"),
    { ssr: false, loading: () => <div className="flex h-64 items-center justify-center"><p className="text-brandText/60">Loading...</p></div> }
);

// Dynamically import the subscription requests content
const SubscriptionRequestsContent = dynamic(
    () => import("@/components/admin/SubscriptionRequestsContent"),
    { ssr: false, loading: () => <div className="flex h-64 items-center justify-center"><p className="text-brandText/60">Loading...</p></div> }
);

type TabType = 'dashboard' | 'resources' | 'taxonomy' | 'profile' | 'subscriptions';

export default function AdminPage() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = (params.locale as string) || "fr";
    const t = useTranslations("adminDashboard");

    // Initialize activeTab from URL parameter or default to dashboard
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const tabParam = searchParams.get('tab') as TabType;
        return tabParam && ['dashboard', 'resources', 'taxonomy', 'profile', 'subscriptions'].includes(tabParam)
            ? tabParam
            : 'dashboard';
    });

    // Dashboard statistics state
    const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    // Fetch dashboard statistics on mount
    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setStatsLoading(true);
                setStatsError(null);
                const data = await getDashboardStatistics();
                setStatistics(data);
            } catch (error: any) {
                console.error('Failed to fetch dashboard statistics:', error);
                setStatsError(error.message || t('errors.loadStatsFailed'));
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    // Update URL when tab changes
    useEffect(() => {
        const currentTab = searchParams.get('tab');
        if (activeTab !== 'dashboard' && currentTab !== activeTab) {
            router.replace(`/${locale}/admin?tab=${activeTab}`, { scroll: false });
        } else if (activeTab === 'dashboard' && currentTab) {
            router.replace(`/${locale}/admin`, { scroll: false });
        }
    }, [activeTab, locale, router, searchParams]);

    const handleTabChange = (tab: TabType) => {
        // For all tabs, just switch the active tab (URL will update via useEffect)
        setActiveTab(tab);
    };

    return (
        <AdminDashboardShell
            activeTab={activeTab}
            onTabChange={handleTabChange}
            locale={locale}
        >
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-brandText">
                            {t('tabs.dashboard')}
                        </h1>
                        <p className="mt-2 text-brandText/70">
                            {t('welcome')}
                        </p>
                    </div>

                    {/* Error Message */}
                    {statsError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
                            {statsError}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        {t('stats.totalUsers')}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        {statsLoading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : (
                                            statistics?.users.total.toLocaleString() || '0'
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-full bg-brandGreen/10 p-3">
                                    <svg className="h-6 w-6 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                {statsLoading ? (
                                    <span className="animate-pulse">Chargement...</span>
                                ) : statistics ? (
                                    <>
                                        <span className={statistics.users.growthPercent >= 0 ? "text-green-600" : "text-red-600"}>
                                            {statistics.users.growthPercent >= 0 ? '+' : ''}{statistics.users.growthPercent}%
                                        </span> {statistics.users.growthLabel}
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        {t('stats.resources')}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        {statsLoading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : (
                                            statistics?.resources.total.toLocaleString() || '0'
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                {statsLoading ? (
                                    <span className="animate-pulse">Chargement...</span>
                                ) : statistics ? (
                                    <>
                                        <span className="text-green-600">+{statistics.resources.newThisPeriod}</span> {statistics.resources.growthLabel}
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        {t('stats.sessions')}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        {statsLoading ? (
                                            <span className="animate-pulse">...</span>
                                        ) : (
                                            statistics?.sessions.total.toLocaleString() || '0'
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                {statsLoading ? (
                                    <span className="animate-pulse">Chargement...</span>
                                ) : statistics ? (
                                    <>
                                        <span className="text-green-600">+{statistics.sessions.newThisPeriod}</span> {statistics.sessions.growthLabel}
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-brandText">
                            {t('tabs.resources')}
                        </h1>
                        <p className="mt-2 text-brandText/70">
                            Gérer toutes les ressources de la plateforme
                        </p>
                    </div>

                    <ResourcesList
                        mode="admin"
                        locale={locale}
                        showCreateButton={true}
                    />
                </div>
            )}

            {/* Taxonomy Tab */}
            {activeTab === 'taxonomy' && (
                <TaxonomyContent locale={locale} />
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <ProfileContent
                    showHeader={false}
                    containerClassName="space-y-6"
                />
            )}

            {/* Subscription Requests Tab */}
            {activeTab === 'subscriptions' && (
                <SubscriptionRequestsContent />
            )}
        </AdminDashboardShell>
    );
}
