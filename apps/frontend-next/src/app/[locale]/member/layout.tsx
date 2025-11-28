import type { ReactNode } from "react";
import {AppShell, MainNavbar} from "@/components/layout";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Layout du module member (espace authentifié).
 *
 * Rôle :
 * - Envelopper toutes les pages de l'espace client avec :
 *   - la barre de navigation client (ClientNavbar),
 *   - le squelette global de l’application (AppShell).
 *
 * Comportement spécifique :
 * - AppShell se charge de :
 *   • afficher GlobalNotice,
 *   • afficher / cacher le footer et la navbar en mode "séance" :
 *       - les routes contenant "seance" (p.ex. /[locale]/member/seance/respiration)
 *         n'affichent ni navbar ni footer pour favoriser la concentration.
 *   • gérer CookieBanner + CookiePreferencesModal.
 *
 * i18n :
 * - Comme pour PublicLayout, ce layout ne manipule pas la locale.
 *   • la langue courante est déterminée au niveau de app/[locale]/layout.tsx,
 *   • les liens + labels sont gérés dans ClientNavbar et les pages via useTranslations.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard roles={["user", "premium", "coach", "admin"]}>
            <AppShell navbar={<MainNavbar mode="client" />}>
                <>
                    {children}
                </>
            </AppShell>
        </AuthGuard> );
}
