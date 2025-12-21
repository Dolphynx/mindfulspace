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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminDashboardShell from "@/components/admin/AdminDashboardShell";
import { ResourcesList } from "@/components/resources";
import { useTranslations } from "@/i18n/TranslationContext";

type TabType = 'dashboard' | 'resources' | 'taxonomy' | 'sessions';

export default function AdminPage() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = pathname.split("/")[1] || "fr";
    const t = useTranslations("adminDashboard");

    // Initialize activeTab from URL parameter or default to dashboard
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const tabParam = searchParams.get('tab') as TabType;
        return tabParam && ['dashboard', 'resources', 'sessions'].includes(tabParam)
            ? tabParam
            : 'dashboard';
    });

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
        if (tab === 'taxonomy') {
            // Navigate to dedicated taxonomy page
            router.push(`/${locale}/admin/taxonomy`);
        } else {
            // For other tabs, just switch the active tab (URL will update via useEffect)
            setActiveTab(tab);
        }
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
                            Bienvenue dans le panneau d'administration MindfulSpace
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        Total Utilisateurs
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        1,234
                                    </p>
                                </div>
                                <div className="rounded-full bg-brandGreen/10 p-3">
                                    <svg className="h-6 w-6 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                <span className="text-green-600">+12%</span> ce mois
                            </p>
                        </div>

                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        Ressources
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        89
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                <span className="text-green-600">+5</span> cette semaine
                            </p>
                        </div>

                        <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-brandText/70">
                                        Sessions
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-brandText">
                                        156
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-brandText/60">
                                <span className="text-green-600">+8</span> aujourd'hui
                            </p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl border border-brandBorder bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-brandText mb-4">
                            Activité récente
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 border-b border-brandBorder pb-4">
                                <div className="rounded-full bg-brandGreen/10 p-2">
                                    <svg className="h-5 w-5 text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-brandText">
                                        Nouvelle ressource créée
                                    </p>
                                    <p className="text-xs text-brandText/60">
                                        "Guide de méditation pour débutants" par Coach Julie
                                    </p>
                                </div>
                                <p className="text-xs text-brandText/60">Il y a 2h</p>
                            </div>
                            <div className="flex items-center gap-4 border-b border-brandBorder pb-4">
                                <div className="rounded-full bg-blue-100 p-2">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-brandText">
                                        Nouvel utilisateur inscrit
                                    </p>
                                    <p className="text-xs text-brandText/60">
                                        sophie.martin@example.com
                                    </p>
                                </div>
                                <p className="text-xs text-brandText/60">Il y a 5h</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-purple-100 p-2">
                                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-brandText">
                                        Session de méditation complétée
                                    </p>
                                    <p className="text-xs text-brandText/60">
                                        "Pleine conscience - 15 min" par 23 utilisateurs
                                    </p>
                                </div>
                                <p className="text-xs text-brandText/60">Il y a 1j</p>
                            </div>
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

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-brandText">
                            {t('tabs.sessions')}
                        </h1>
                        <p className="mt-2 text-brandText/70">
                            Gérer les sessions de méditation
                        </p>
                    </div>

                    {/* Placeholder for future session management */}
                    <div className="rounded-xl border border-brandBorder bg-white p-12 text-center shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-brandText/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-brandText">
                            Gestion des sessions
                        </h3>
                        <p className="mt-2 text-sm text-brandText/60">
                            Cette section sera implémentée prochainement
                        </p>
                    </div>
                </div>
            )}
        </AdminDashboardShell>
    );
}
