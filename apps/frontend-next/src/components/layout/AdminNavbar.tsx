"use client";

/**
 * Navbar du module Admin.
 *
 * Version vide :
 * - Affiche uniquement le logo + un placeholder traduisible.
 * - Détecte automatiquement la locale à partir du pathname.
 * - Structure prête pour recevoir des actions / liens d’administration.
 *
 * Peut être facilement enrichi :
 *   - gestion des utilisateurs,
 *   - logs système,
 *   - monitoring,
 *   - etc.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";

export function AdminNavbar() {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "fr";
    const t = useTranslations("navbarAdmin");

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">

                {/* Logo admin */}
                <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                    <Image
                        src="/images/MindfulSpace_logo.jpg"
                        alt="MindfulSpace logo"
                        width={90}
                        height={40}
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* Admin navigation */}
                <nav className="flex items-center gap-6 text-sm text-brandText">
                    <Link
                        href={`/${locale}/admin/resources`}
                        className="hover:text-brandPrimary transition-colors"
                    >
                        {t("resources")}
                    </Link>
                    <Link
                        href={`/${locale}/admin/meditation-sessions`}
                        className="hover:text-brandPrimary transition-colors"
                    >
                        {t("sessions")}
                    </Link>
                    <Link
                        href={`/${locale}/member/world`}
                        className="flex items-center gap-1 hover:text-brandPrimary transition-colors border-l border-brandBorder pl-6"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t("backToApp")}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
