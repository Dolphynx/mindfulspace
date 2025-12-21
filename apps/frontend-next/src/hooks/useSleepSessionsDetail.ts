"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSleepSessionsDetail, type SleepSession } from "@/lib/api/sleep";
import type { SleepErrorType } from "@/hooks/useSleepSessions";

export function useSleepSessionsDetail(lastDays: number = 30) {
    const [sessions, setSessions] = useState<SleepSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<SleepErrorType>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const data = await fetchSleepSessionsDetail({ lastDays });
            setSessions(data);
        } catch (e) {
            console.error("[useSleepSessionsDetail] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [lastDays]);

    useEffect(() => {
        void load();
    }, [load]);

    return { sessions, loading, errorType, reload: load } as const;
}
