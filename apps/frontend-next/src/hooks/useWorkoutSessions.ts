"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchLastWorkoutSessions,
    fetchWorkoutTypes,
    createWorkoutSession,
    type WorkoutSession,
    type WorkoutTypeItem,
    type CreateWorkoutSessionPayload,
} from "@/lib/api/workout";

export type WorkoutErrorType = "load" | "save" | "types" | null;

type CreateSessionInput = CreateWorkoutSessionPayload;

type UseWorkoutSessionsResult = {
    sessions: WorkoutSession[];
    types: WorkoutTypeItem[];
    loading: boolean;
    errorType: WorkoutErrorType;
    reload: () => Promise<void>;
    reloadTypes: () => Promise<void>;
    createSession: (payload: CreateSessionInput) => Promise<void>;
};

export function useWorkoutSessions(
    baseUrl?: string,
): UseWorkoutSessionsResult {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [types, setTypes] = useState<WorkoutTypeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] =
        useState<WorkoutErrorType>(null);

    const effectiveBaseUrl = baseUrl;

    /** LOAD LAST 7 DAYS */
    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchLastWorkoutSessions(
                effectiveBaseUrl,
            );
            setSessions(data);
        } catch (e) {
            console.error("[useWorkoutSessions] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [effectiveBaseUrl]);

    /** LOAD EXERCISE TYPES */
    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchWorkoutTypes(effectiveBaseUrl);
            setTypes(data);
        } catch (e) {
            console.error("[useWorkoutSessions] types failed", e);
            setErrorType("types");
        }
    }, [effectiveBaseUrl]);

    /** INITIAL LOAD */
    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    /** CREATE WORKOUT SESSION */
    const createSession = useCallback(
        async (payload: CreateSessionInput) => {
            setErrorType(null);
            try {
                await createWorkoutSession(payload, effectiveBaseUrl);
                await load(); // refresh list
            } catch (e) {
                console.error("[useWorkoutSessions] save failed", e);
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
    WorkoutSession,
    WorkoutTypeItem,
} from "@/lib/api/workout";
