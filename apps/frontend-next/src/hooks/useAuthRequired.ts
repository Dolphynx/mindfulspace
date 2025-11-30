"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type RoleName = "user" | "premium" | "coach" | "admin";

/**
 * Représentation minimale de l’utilisateur authentifié telle que renvoyée
 * par l’endpoint `/auth/me`.
 *
 * - `roles` est un tableau de chaînes normalisées (ex. `"premium"`).
 */
type AuthUser = {
    id: string;
    email: string;
    roles: RoleName[];
};

/**
 * Options permettant de restreindre l’accès du hook à certains rôles.
 *
 * Exemple :
 * ```ts
 * useAuthRequired({ roles: ["admin"] })
 * ```
 */
type Options = {
    roles?: RoleName[];
};

/**
 * Hook d’authentification “forte” utilisé sur les pages protégées.
 *
 * Son comportement est le suivant :
 *
 * ### 1. Vérification de la session utilisateur
 * Le hook interroge l’endpoint `/auth/me` :
 * - si l’utilisateur **n’est pas authentifié**, redirection vers la page login,
 *   avec un paramètre `redirectTo` permettant de revenir à la page initiale ;
 * - si la réponse est valide, l’utilisateur est stocké dans l’état local.
 *
 * ### 2. Vérification optionnelle des rôles
 * Si l’option `roles` est fournie :
 * - les rôles renvoyés par le backend sont normalisés (`toLowerCase()`),
 * - on vérifie qu’au moins un rôle requis est présent,
 * - sinon redirection vers `/forbidden`.
 *
 * ### 3. Gestion du chargement
 * Pendant la récupération / vérification, `loading = true`.
 * Une fois la vérification terminée (succès ou redirection), `loading = false`.
 *
 * ### Exemple d’utilisation
 * ```ts
 * const { user, loading } = useAuthRequired();
 * ```
 *
 * @param options Rôles requis pour accéder au composant (facultatif).
 * @returns L’utilisateur authentifié et l’état de chargement.
 */
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
                        credentials: "include", // envoie systématique du cookie de session
                    }
                );

                // Cas non authentifié → redirection immédiate vers login
                if (res.status === 401 || res.status === 403) {
                    const segments = pathname.split("/");
                    const locale = segments[1] || "fr";
                    router.replace(`/${locale}/login?redirectTo=${encodeURIComponent(pathname)}`);
                    return;
                }

                // Cas anomalie serveur ou réponse non exploitable
                if (!res.ok) {
                    console.error("Erreur /auth/me", await res.text());
                    return;
                }

                const data: AuthUser = await res.json();
                if (cancelled) return;

                /**
                 * Vérification des rôles si nécessaire :
                 * - normalisation en minuscule
                 * - matching par inclusion
                 */
                if (options?.roles?.length) {
                    const userRoles = data.roles.map((r) => r.toLowerCase());
                    const hasRole = options.roles
                        .map((r) => r.toLowerCase())
                        .some((r) => userRoles.includes(r));

                    if (!hasRole) {
                        const segments = pathname.split("/");
                        const locale = segments[1] || "fr";
                        router.replace(`/${locale}/forbidden`);
                        return;
                    }
                }

                setUser(data);
            } finally {
                // Empêche toute mise à jour d'état si le composant a été démonté
                if (!cancelled) setLoading(false);
            }
        }

        load();

        // Flag d'annulation pour éviter les updates post-unmount
        return () => {
            cancelled = true;
        };
    }, [pathname, router, options?.roles]);

    return { user, loading };
}
