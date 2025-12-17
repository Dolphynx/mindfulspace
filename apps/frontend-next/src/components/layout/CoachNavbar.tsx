"use client";

/**
 * Navbar du module Coach.
 *
 * Version minimaliste :
 * - Aucun lien pour l’instant (structure prête pour extension).
 * - Intègre déjà l’i18n via useTranslations("navbarCoach").
 * - Détecte automatiquement la locale à partir de l’URL.
 *
 * Cette navbar est purement présentational.
 * Toute logique additionnelle (menus, dropdown, profil…) peut être ajoutée plus tard.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";

export function CoachNavbar() {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "fr";

    // Le namespace "navbarCoach" est déjà prêt dans le dictionnaire.
    const t = useTranslations("navbarCoach");

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">

                {/* Logo → renvoie vers /fr/coach ou /en/coach */}
                <Link href={`/${locale}/coach`} className="flex items-center gap-2">
                    <Image
                        src="/images/MindfulSpace_logo.jpg"
                        alt="MindfulSpace logo"
                        width={90}
                        height={40}
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* Coach navigation */}
                <nav className="flex items-center gap-6 text-sm text-brandText">
                    <Link
                        href={`/${locale}/coach/resources`}
                        className="hover:text-brandPrimary transition-colors"
                    >
                        {t("resources")}
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
