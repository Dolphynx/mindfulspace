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

                {/* Bloc d’actions (vide pour l’instant) */}
                <nav className="flex items-center gap-4 text-sm text-brandText">
                    {/* Exemple futur :
                    <Link href={`/${locale}/coach/dashboard`}>{t("dashboard")}</Link>
                    */}
                    <span className="text-brandText/50 italic">
                        {t("emptyPlaceholder")}
                    </span>
                </nav>
            </div>
        </header>
    );
}
