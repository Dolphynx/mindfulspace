import type { ReactNode } from "react";
import { AppShell, MainNavbar } from "@/components/layout";
import {AppToastProvider} from "@/components";

/**
 * Layout du module public.
 *
 * Rôle :
 * - Envelopper toutes les pages publiques avec :
 *   - la barre de navigation publique (PublicNavbar),
 *   - le squelette global de l’application (AppShell) :
 *       • GlobalNotice,
 *       • gestion du footer,
 *       • gestion de la bannière cookies,
 *       • etc.
 *
 * Points importants :
 * - Ce layout est utilisé pour toutes les routes sous `(public)` :
 *   /[locale]/(public)/*
 * - Il ne s'occupe pas de l’i18n directement :
 *   • la locale est gérée au niveau de app/[locale]/layout.tsx,
 *   • les textes sont traduits dans les composants enfants via useTranslations.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <AppToastProvider>
            <AppShell navbar={<MainNavbar mode="public" />}>
                <>
                    {children}
                </>
            </AppShell>
        </AppToastProvider>
    );
}
