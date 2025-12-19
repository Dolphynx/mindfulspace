"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchExerciceSessionsDetail,
    fetchExerciceContents,
    type ExerciceSession,
    type ExerciceContentItem,
} from "@/lib/api/exercice";
import type { ExerciceErrorType } from "@/hooks/useExerciceSessions";

export function useExerciceSessionsDetail(lastDays: number = 30) {
    const [sessions, setSessions] = useState<ExerciceSession[]>([]);
    const [types, setTypes] = useState<ExerciceContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<ExerciceErrorType>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const data = await fetchExerciceSessionsDetail({ lastDays });
            setSessions(data);
        } catch (e) {
            console.error("[useExerciceSessionsDetail] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [lastDays]);

    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchExerciceContents();
            setTypes(data);
        } catch (e) {
            console.error("[useExerciceSessionsDetail] types failed", e);
            setErrorType("types");
        }
    }, []);

    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    return { sessions, types, loading, errorType, reload: load, reloadTypes: loadTypes } as const;
}
