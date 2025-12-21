"use client";

import { useEffect, useState } from "react";
import { fetchUserPrograms, type UserProgram } from "@/lib/api/program";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";
import { useLocaleFromPath} from "@/hooks/useLocalFromPath";

export function useUserPrograms() {
    const locale = useLocaleFromPath();
    const hub = useWorldHubOptional();
    const refreshKey = hub?.refreshKey ?? 0;

    const [programs, setPrograms] = useState<UserProgram[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);

        (async () => {
            try {
                const data = await fetchUserPrograms(locale);
                if (!cancelled) setPrograms(data);
            } catch {
                if (!cancelled) setPrograms([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [locale, refreshKey]);

    return { programs, loading };
}
