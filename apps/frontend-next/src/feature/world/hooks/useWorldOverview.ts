"use client";

import { useEffect, useState } from "react";
import { getWorldOverview, type WorldOverviewDto } from "@/lib/api/worldOverview";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

/**
 * Hook client dédié au chargement des KPIs agrégés du World Hub.
 *
 * Responsabilités :
 * - Récupérer les métriques globales du dashboard via l’API.
 * - Exposer un état typé couvrant les phases `idle`, `loading`, `success` et `error`.
 * - Se synchroniser automatiquement avec le mécanisme de rafraîchissement du World Hub.
 */

/**
 * État exposé par le hook `useWorldOverview`.
 *
 * Modélisé sous forme d’union discriminée afin de :
 * - garantir l’exhaustivité des cas côté consommateur,
 * - simplifier le rendu conditionnel dans l’UI.
 */
export type UseWorldOverviewState =
    | { status: "idle" | "loading"; data: null; error: null }
    | { status: "success"; data: WorldOverviewDto; error: null }
    | { status: "error"; data: null; error: Error };

/**
 * Charge les métriques agrégées du dashboard World.
 *
 * Fonctionnement :
 * - Passe l’état à `loading` à chaque déclenchement.
 * - Effectue l’appel API via `getWorldOverview`.
 * - Met à jour l’état en `success` ou `error` selon le résultat.
 * - Ignore toute mise à jour d’état après démontage du composant consommateur.
 *
 * Dépendances :
 * - Le hook se réexécute à chaque modification de `refreshKey`,
 *   permettant une resynchronisation globale du hub.
 *
 * @returns État courant du chargement des métriques World.
 */
export function useWorldOverview(): UseWorldOverviewState {
    const { refreshKey } = useWorldHub();

    const [state, setState] = useState<UseWorldOverviewState>({
        status: "idle",
        data: null,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        setState({ status: "loading", data: null, error: null });

        getWorldOverview()
            .then((data) => {
                if (!mounted) return;
                setState({ status: "success", data, error: null });
            })
            .catch((err: unknown) => {
                if (!mounted) return;
                setState({
                    status: "error",
                    data: null,
                    error: err instanceof Error ? err : new Error("Unknown error"),
                });
            });

        return () => {
            mounted = false;
        };
    }, [refreshKey]);

    return state;
}
