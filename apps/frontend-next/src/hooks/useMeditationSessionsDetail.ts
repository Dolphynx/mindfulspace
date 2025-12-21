"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchMeditationSessionsDetail,
    fetchMeditationTypes,
    type MeditationSession,
    type MeditationTypeItem,
} from "@/lib/api/meditation";
import type { MeditationErrorType } from "@/hooks/useMeditationSessions";

export function useMeditationSessionsDetail(lastDays: number = 30) {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [types, setTypes] = useState<MeditationTypeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<MeditationErrorType>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const data = await fetchMeditationSessionsDetail(lastDays);
            setSessions(data);
        } catch (e) {
            console.error("[useMeditationSessionsDetail] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [lastDays]);

    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchMeditationTypes();
            setTypes(data);
        } catch (e) {
            console.error("[useMeditationSessionsDetail] types failed", e);
            setErrorType("types");
        }
    }, []);

    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    return { sessions, types, loading, errorType, reload: load, reloadTypes: loadTypes } as const;
}
