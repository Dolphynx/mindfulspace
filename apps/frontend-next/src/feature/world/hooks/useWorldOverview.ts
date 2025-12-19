"use client";

import { useEffect, useState } from "react";
import { getWorldOverview, type WorldOverviewDto } from "@/lib/api/worldOverview";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

/**
 * @file useWorldOverview.ts
 * @description
 * Hook client pour charger les KPIs agrégés du World Hub.
 */

export type UseWorldOverviewState =
    | { status: "idle" | "loading"; data: null; error: null }
    | { status: "success"; data: WorldOverviewDto; error: null }
    | { status: "error"; data: null; error: Error };

/**
 * Charge les métriques agrégées du dashboard.
 *
 * @returns State de chargement + DTO.
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
