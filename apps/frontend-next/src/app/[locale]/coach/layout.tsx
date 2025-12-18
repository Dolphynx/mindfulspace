import type { ReactNode } from "react";
import { AppShell, CoachNavbar } from "@/components/layout";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
 * **Sécurité** : Protégé par AuthGuard, accessible aux rôles "coach" et "admin".
 * Les admins ont accès au dashboard coach pour superviser et tester.
 *
 * i18n :
 * - La locale est résolue au niveau de app/[locale]/layout.tsx.
 * - Tous les textes proviennent des composants enfants (navbar, pages…).
 */
export default function CoachLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard roles={["coach", "admin"]}>
            <AppShell navbar={<CoachNavbar />}>
                <>
                    {children}
                </>
            </AppShell>
        </AuthGuard>
    );
}
