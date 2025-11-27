import type { ReactNode } from "react";
import { AppShell, CoachNavbar } from "@/components/layout";

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
                {children}
            </>
        </AppShell>
    );
}
