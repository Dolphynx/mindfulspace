"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchExerciceSessionsDetail,
    fetchExerciceContents,
    type ExerciceSession,
    type ExerciceContentItem,
} from "@/lib/api/exercise";
import type { ExerciceErrorType } from "@/hooks/useExerciseSessions";
import {useLocaleFromPath} from "@/hooks/useLocalFromPath";

export function useExerciseSessionsDetail(lastDays: number = 30) {
    const [sessions, setSessions] = useState<ExerciceSession[]>([]);
    const [types, setTypes] = useState<ExerciceContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<ExerciceErrorType>(null);
    const locale = useLocaleFromPath();

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const data = await fetchExerciceSessionsDetail(locale, { lastDays });
            setSessions(data);
        } catch (e) {
            console.error("[useExerciseSessionsDetail] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [lastDays]);

    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchExerciceContents(locale);
            setTypes(data);
        } catch (e) {
            console.error("[useExerciseSessionsDetail] types failed", e);
            setErrorType("types");
        }
    }, []);

    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    return { sessions, types, loading, errorType, reload: load, reloadTypes: loadTypes } as const;
}
