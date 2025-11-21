import type { ReactNode } from "react";
import { AppShell, CoachNavbar } from "@/components/layout";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * Layout du module coach.
 *
 * - Enveloppe toutes les pages du dashboard coach.
 * - Utilise AppShell pour gérer :
 *     • GlobalNotice,
 *     • navbar coach,
 *     • footer,
 *     • CookieBanner + CookiePreferencesModal,
 *     • masquage auto de navbar/footer en mode séance.
 *
 * i18n :
 * - La locale est résolue au niveau de app/[locale]/layout.tsx.
 * - Tous les textes proviennent des composants enfants (navbar, pages…).
 */
export default function CoachLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell navbar={<CoachNavbar />}>
            <>
                <div className="w-full border-b border-brandBorder bg-brandSurface/60 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-2 flex justify-end">
                        <LanguageSwitcher />
                    </div>
                </div>
                {children}
            </>
        </AppShell>
    );
}
