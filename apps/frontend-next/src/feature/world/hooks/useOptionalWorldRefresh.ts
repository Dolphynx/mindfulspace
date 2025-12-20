"use client";

import { useCallback } from "react";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

/**
 * Hook utilitaire exposant des helpers de rafraîchissement optionnels du World Hub.
 *
 * Ce hook est conçu pour être utilisé dans des composants pouvant être rendus
 * **avec ou sans** le contexte `WorldHubProvider`.
 *
 * Principe :
 * - Si le provider est présent, le hook déclenche un rafraîchissement global
 *   via l’incrément de la `refreshKey`.
 * - Si le provider est absent, les appels sont sans effet et n’introduisent
 *   aucune erreur.
 */
export function useOptionalWorldRefresh() {
    const worldHub = useWorldHubOptional();

    /**
     * Déclenche un rafraîchissement du World Hub si le contexte est disponible.
     *
     * L’appel est sécurisé via l’opérateur optionnel afin d’éviter toute dépendance
     * stricte à la présence du provider dans l’arbre React.
     */
    const refresh = useCallback(() => {
        worldHub?.bumpRefreshKey?.();
    }, [worldHub]);

    /**
     * Enveloppe une fonction asynchrone et déclenche un rafraîchissement
     * du World Hub après son exécution.
     *
     * Cas d’usage typiques :
     * - Création ou mise à jour de données impactant les vues du hub.
     * - Actions utilisateur nécessitant une resynchronisation globale.
     *
     * @typeParam T - Type de la valeur retournée par la fonction asynchrone.
     * @param fn - Fonction asynchrone à exécuter.
     * @returns Résultat de la fonction asynchrone `fn`.
     */
    const withRefresh = useCallback(
        async <T,>(fn: () => Promise<T>) => {
            const result = await fn();
            refresh();
            return result;
        },
        [refresh],
    );

    return { refresh, withRefresh } as const;
}
