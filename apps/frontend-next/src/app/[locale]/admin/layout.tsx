import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Layout du module admin.
 *
 * - Protège l'accès au panneau d'administration
 * - AdminDashboardShell gère la navigation et la structure
 *
 * **Sécurité** : Protégé par AuthGuard, réservé au rôle "admin" uniquement.
 *
 * i18n :
 * - Rien à faire ici : la langue est injectée depuis app/[locale]/layout.tsx.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard roles={["admin"]}>
            {children}
        </AuthGuard>
    );
}
