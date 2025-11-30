// AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type RoleName = "user" | "premium" | "coach" | "admin";

type AuthGuardProps = {
    children: ReactNode;
    roles?: RoleName[];
};

export function AuthGuard({ children, roles }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // 1) Pas connecté → redirection vers /[locale]/auth/login
        if (!user) {
            const segments = (pathname ?? "").split("/");
            const locale = segments[1] || "fr";

            const redirectTo = encodeURIComponent(pathname || `/${locale}`);
            router.replace(`/${locale}/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
            return;
        }

        // 2) Optionnel : filtrage par rôle
        if (roles && roles.length > 0) {
            const userRoles = user.roles ?? [];
            const hasRole = roles.some((r) => userRoles.includes(r));
            if (!hasRole) {
                const segments = pathname.split("/");
                const locale = segments[1] || "fr";
                router.replace(`/${locale}`); // ou une page "forbidden"
            }
        }
    }, [user, loading, roles, router, pathname]);

    if (loading) return null;
    if (!user) return null;

    if (roles && roles.length > 0) {
        const userRoles = user.roles ?? [];
        const hasRole = roles.some((r) => userRoles.includes(r));
        if (!hasRole) return null;
    }

    return <>{children}</>;
}
