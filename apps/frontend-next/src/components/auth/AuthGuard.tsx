"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type RoleName = "user" | "premium" | "coach" | "admin";

type AuthGuardProps = {
    children: ReactNode;
    roles?: RoleName[]; // optionnel
};

export function AuthGuard({ children, roles }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // pas connecté → on envoie vers la page de login
        if (!user) {
            router.replace(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
            return;
        }

        // si on a des rôles exigés → vérifier
        if (roles && roles.length > 0) {
            const userRoles = user.roles ?? []; // supposition: tableau de strings
            const hasRole = roles.some((r) => userRoles.includes(r));
            if (!hasRole) {
                router.replace(`/forbidden`); // ou autre route
            }
        }
    }, [user, loading, roles, router, pathname]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) return null;

    if (roles && roles.length > 0) {
        const userRoles = user.roles ?? [];
        const hasRole = roles.some((r) => userRoles.includes(r));
        if (!hasRole) return null;
    }

    return <>{children}</>;
}
