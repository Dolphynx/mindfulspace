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

                {/* Placeholder futur pour actions admin */}
                <nav className="flex items-center gap-4 text-sm text-brandText">
                    {/* Exemple futur :
                    <Link href={`/${locale}/admin/users`}>{t("users")}</Link>
                    */}
                    <span className="text-brandText/50 italic">
                        {t("emptyPlaceholder")}
                    </span>
                </nav>
            </div>
        </header>
    );
}
