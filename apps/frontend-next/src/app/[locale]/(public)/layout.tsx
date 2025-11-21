import type { ReactNode } from "react";
import { AppShell, MainNavbar } from "@/components/layout";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
        <AppShell navbar={<MainNavbar mode="public" />}>
            <>
                {/* Barre fine en haut du contenu public avec le sélecteur de langue */}
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
