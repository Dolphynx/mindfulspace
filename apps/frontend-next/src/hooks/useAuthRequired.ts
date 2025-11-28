"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type RoleName = "user" | "premium" | "coach" | "admin";

type AuthUser = {
    id: string;
    email: string;
    roles: { name: RoleName }[];
};

type Options = {
    roles?: RoleName[]; // optionnel : si tu veux restreindre à certains rôles
};

export function useAuthRequired(options?: Options) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/me`,
                    {
                        credentials: "include", // important, pour envoyer les cookies
                    }
                );

                if (res.status === 401 || res.status === 403) {
                    // pas connecté -> rediriger vers le login
                    const segments = pathname.split("/");
                    const locale = segments[1] || "fr";
                    router.replace(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`);
                    return;
                }

                if (!res.ok) {
                    console.error("Erreur /auth/me", await res.text());
                    return;
                }

                const data: AuthUser = await res.json();
                if (cancelled) return;

                // si roles exigés, vérifier
                if (options?.roles?.length) {
                    const userRoles = data.roles.map((r) => r.name);
                    const hasRole = options.roles.some((r) => userRoles.includes(r));
                    if (!hasRole) {
                        // pas le bon rôle -> tu peux rediriger vers une page 403 ou accueil
                        const segments = pathname.split("/");
                        const locale = segments[1] || "fr";
                        router.replace(`/${locale}/forbidden`);
                        return;
                    }
                }

                setUser(data);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [pathname, router, options?.roles]);

    return { user, loading };
}
