"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSleepSessionsDetail, type SleepSession } from "@/lib/api/sleep";
import type { SleepErrorType } from "@/hooks/useSleepSessions";
import {getSleepHistory, saveSleepHistory} from "@/offline-sync/sleep-history";

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
            await saveSleepHistory(data); // cache
        } catch (e) {
            try {
                const cached = await getSleepHistory(lastDays);
                setSessions(cached);
                setErrorType("offline");
            } catch (cacheError) {
                console.error("[useSleepSessionsDetail] cache load failed", cacheError);
                setErrorType("load");
            }
        } finally {
            setLoading(false);
        }
    }, [lastDays]);

    useEffect(() => {
        void load();
    }, [load]);

    return { sessions, loading, errorType, reload: load } as const;
}
