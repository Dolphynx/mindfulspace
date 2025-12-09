"use client";

import { useCallback, useEffect, useState } from "react";

import {
    fetchLastExerciceSessions,
    fetchExerciceContents,
    createExerciceSession,
    type ExerciceSession,
    type ExerciceContentItem,
    type CreateExerciceSessionPayload,
} from "@/lib/api/exercice";

export type ExerciceErrorType = "load" | "save" | "types" | null;

type CreateSessionInput = CreateExerciceSessionPayload;

type UseExerciceSessionsResult = {
    sessions: ExerciceSession[];
    types: ExerciceContentItem[];
    loading: boolean;
    errorType: ExerciceErrorType;
    reload: () => Promise<void>;
    reloadTypes: () => Promise<void>;
    createSession: (payload: CreateSessionInput) => Promise<void>;
};

export function useExerciceSessions(
    baseUrl?: string,
): UseExerciceSessionsResult {
    const [sessions, setSessions] = useState<ExerciceSession[]>([]);
    const [types, setTypes] = useState<ExerciceContentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] =
        useState<ExerciceErrorType>(null);

    const effectiveBaseUrl = baseUrl;

    /** LOAD LAST 7 DAYS */
    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchLastExerciceSessions(
                effectiveBaseUrl,
            );
            setSessions(data);
        } catch (e) {
            console.error("[useExerciceSessions] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [effectiveBaseUrl]);

    /** LOAD EXERCISE CONTENTS */
    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchExerciceContents(effectiveBaseUrl);
            setTypes(data);
        } catch (e) {
            console.error("[useExerciceSessions] types failed", e);
            setErrorType("types");
        }
    }, [effectiveBaseUrl]);

    /** INITIAL LOAD */
    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    /** CREATE EXERCISE SESSION */
    const createSession = useCallback(
        async (payload: CreateSessionInput) => {
            setErrorType(null);
            try {
                await createExerciceSession(payload, effectiveBaseUrl);
                await load(); // refresh list
            } catch (e) {
                console.error("[useExerciceSessions] save failed", e);
                setErrorType("save");
                throw e;
            }
        },
        [effectiveBaseUrl, load],
    );

    return {
        sessions,
        types,
        loading,
        errorType,
        reload: load,
        reloadTypes: loadTypes,
        createSession,
    };
}

export type {
    ExerciceSession,
    ExerciceContentItem,
} from "@/lib/api/exercice";
