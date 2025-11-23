"use client";

import { useCallback, useEffect, useState } from "react";
import {
    createMeditationSession,
    fetchLastMeditationSessions,
    type CreateMeditationSessionPayload,
    type MeditationSession,
} from "@/lib/meditation-api";

export type MeditationErrorType = "load" | "save" | null;

type UseMeditationSessionsResult = {
    sessions: MeditationSession[];
    loading: boolean;
    errorType: MeditationErrorType;
    reload: () => Promise<void>;
    createSession: (payload: CreateMeditationSessionPayload) => Promise<void>;
};

/**
 * Gère :
 * - le chargement des séances
 * - la création d'une séance
 * - un code d'erreur (load/save) que l'UI traduira via i18n
 */
export function useMeditationSessions(
    baseUrl?: string,
): UseMeditationSessionsResult {
    const [sessions, setSessions] = useState<MeditationSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] =
        useState<MeditationErrorType>(null);

    const effectiveBaseUrl =
        baseUrl ?? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setErrorType(null);

            const data = await fetchLastMeditationSessions(
                effectiveBaseUrl,
            );
            setSessions(data);
        } catch (e) {
            console.error(e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [effectiveBaseUrl]);

    useEffect(() => {
        void load();
    }, [load]);

    const createSession = useCallback(
        async (payload: CreateMeditationSessionPayload) => {
            try {
                setErrorType(null);
                await createMeditationSession(payload, effectiveBaseUrl);
                await load();
            } catch (e) {
                console.error(e);
                setErrorType("save");
                throw e;
            }
        },
        [effectiveBaseUrl, load],
    );

    return {
        sessions,
        loading,
        errorType,
        reload: load,
        createSession,
    };
}

export type { MeditationSession } from "@/lib/meditation-api";
