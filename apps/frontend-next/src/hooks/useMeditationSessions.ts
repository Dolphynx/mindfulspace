"use client";

import { useCallback, useEffect, useState } from "react";
import {
    createMeditationSession,
    fetchLastMeditationSessions,
    fetchMeditationTypes,
    type CreateMeditationSessionPayload,
    type MeditationSession,
    type MeditationTypeItem,
} from "@/lib/api/meditation";

export type MeditationErrorType = "load" | "save" | "types" | null;

// Pour lisibilité : ce que les composants passent au hook
type CreateSessionInput = CreateMeditationSessionPayload;

type UseMeditationSessionsResult = {
    sessions: MeditationSession[];
    types: MeditationTypeItem[];
    loading: boolean;
    errorType: MeditationErrorType;
    reload: () => Promise<void>;
    reloadTypes: () => Promise<void>;
    createSession: (payload: CreateSessionInput) => Promise<void>;
};

export function useMeditationSessions(
    baseUrl?: string,
): UseMeditationSessionsResult {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [types, setTypes] = useState<MeditationTypeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] =
        useState<MeditationErrorType>(null);

    const effectiveBaseUrl = baseUrl;

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchLastMeditationSessions(
                effectiveBaseUrl,
            );
            setSessions(data);
        } catch (e) {
            console.error("[useMeditationSessions] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [effectiveBaseUrl]);

    const loadTypes = useCallback(async () => {
        try {
            const data = await fetchMeditationTypes(effectiveBaseUrl);
            setTypes(data);
        } catch (e) {
            console.error("[useMeditationSessions] types failed", e);
            setErrorType("types");
        }
    }, [effectiveBaseUrl]);

    useEffect(() => {
        void load();
        void loadTypes();
    }, [load, loadTypes]);

    const createSession = useCallback(
        async (payload: CreateSessionInput) => {
            setErrorType(null);
            try {
                await createMeditationSession(
                    payload,
                    effectiveBaseUrl,
                );
                await load();
            } catch (e) {
                console.error("[useMeditationSessions] save failed", e);
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

// 🔁 Ré-export des types pour les composants
export type {
    MeditationSession,
    MeditationTypeItem,
} from "@/lib/api/meditation";
