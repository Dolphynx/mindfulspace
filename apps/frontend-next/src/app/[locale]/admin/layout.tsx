import type { ReactNode } from "react";
import {AppShell, AdminNavbar} from "@/components/layout";

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
                {children}
            </>
        </AppShell>
    );
}
