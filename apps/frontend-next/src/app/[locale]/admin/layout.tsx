import type { ReactNode } from "react";
import {AppShell, AdminNavbar} from "@/components/layout";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * Layout du module admin.
 *
 * - Structure l’espace d’administration interne.
 * - S’appuie sur AppShell pour toutes les features “core” :
 *     • GlobalNotice,
 *     • navbar admin,
 *     • footer global,
 *     • gestion cookies,
 *     • masquage séance si nécessaire.
 *
 * i18n :
 * - Rien à faire ici : la langue est injectée depuis app/[locale]/layout.tsx.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell navbar={<AdminNavbar />}>
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
