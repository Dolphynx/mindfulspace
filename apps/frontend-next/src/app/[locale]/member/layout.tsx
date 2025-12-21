import type { ReactNode } from "react";
import { AppShell, MainNavbar } from "@/components/layout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MemberProviders } from "@/app/[locale]/member/Providers";

/**
 * Layout de l’espace authentifié (module member).
 *
 * @remarks
 * Ce layout encapsule l’ensemble des pages client protégées par authentification.
 * Il délègue :
 * - la protection d’accès à {@link AuthGuard},
 * - la structure d’interface globale à {@link AppShell},
 * - les providers transverses (toasts, confettis, etc.) à {@link MemberProviders}.
 *
 * Le layout ne gère pas directement la locale (i18n). La locale est pilotée
 * au niveau du layout racine et les libellés sont résolus dans les composants
 * et pages via le système de traductions.
 *
 * @param props Propriétés du composant.
 * @param props.children Contenu rendu dans la zone principale de l’AppShell.
 * @returns Le layout “member” prêt à l’affichage.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard roles={["user", "premium", "coach", "admin"]}>
            <MemberProviders>
                <AppShell navbar={<MainNavbar mode="client" />}>{children}</AppShell>
            </MemberProviders>
        </AuthGuard>
    );
}
