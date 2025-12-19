// src/components/world/state/useOptionalWorldRefresh.ts
"use client";

import { useCallback } from "react";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

export function useOptionalWorldRefresh() {
    const worldHub = useWorldHubOptional();

    const refresh = useCallback(() => {
        worldHub?.bumpRefreshKey?.();
    }, [worldHub]);

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
