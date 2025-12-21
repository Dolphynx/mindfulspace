"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchLastSleepSessions,
    createSleepSession,
    type SleepSession,
    type CreateSleepSessionPayload,
    type CreateSleepSessionResponse,
} from "@/lib/api/sleep";
import { useBadgeToasts } from "@/components/badges/BadgeToastProvider";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";

export type SleepErrorType = "load" | "save" | "offline" | null;

type UseSleepSessionsResult = {
    sessions: SleepSession[];
    loading: boolean;
    errorType: SleepErrorType;
    reload: () => Promise<void>;
    createSession: (payload: CreateSleepSessionPayload) => Promise<void>;
};

export function useSleepSessions(baseUrl?: string): UseSleepSessionsResult {
    const [sessions, setSessions] = useState<SleepSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<SleepErrorType>(null);

    const effectiveBaseUrl = baseUrl;

    /**
     * Load all sleep sessions.
     */
    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchLastSleepSessions(effectiveBaseUrl);
            setSessions(data);
        } catch (e) {
            console.error("[useSleepSessions] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [effectiveBaseUrl]);

    /**
     * Initial load
     */
    useEffect(() => {
        void load();
    }, [load]);

    /**
     * Create a session and reload
     */
    const { pushBadges } = useBadgeToasts();

    const createSession = useCallback(
        async (payload: CreateSleepSessionPayload) => {
            setErrorType(null);

            try {
                const { newBadges }: CreateSleepSessionResponse =
                    await createSleepSession(payload, effectiveBaseUrl);

                if (Array.isArray(newBadges) && newBadges.length > 0) {
                    pushBadges(newBadges.map(mapApiBadgeToToastItem));
                }

                await load();
            } catch (e) {
                console.error("[useSleepSessions] save failed", e);
                setErrorType("save");
                throw e;
            }
        },
        [effectiveBaseUrl, load, pushBadges],
    );

    return {
        sessions,
        loading,
        errorType,
        reload: load,
        createSession,
    };
}

export type { SleepSession } from "@/lib/api/sleep";
