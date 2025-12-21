"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchPrograms,
    createProgram,
    subscribeToProgram,
    type ProgramItem,
    type CreateProgramPayload, unsubscribeFromProgram, getProgramSubscriptionStatus,
} from "@/lib/api/program";
import {useLocaleFromPath} from "@/hooks/useLocalFromPath";

export type ProgramErrorType = "load" | "save" | "single" | null;

export function usePrograms(baseUrl?: string) {
    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<ProgramErrorType>(null);
    const locale = useLocaleFromPath();

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchPrograms(locale, baseUrl);
            setPrograms(data);
        } catch (e) {
            console.error("[usePrograms] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (payload: CreateProgramPayload) => {
            setErrorType(null);

            try {
                await createProgram(payload, baseUrl);
                await load();
            } catch (e) {
                console.error("[usePrograms] save failed", e);
                setErrorType("save");
                throw e;
            }
        },
        [baseUrl, load]
    );

    const subscribe = useCallback(
        async (programId: string) => {
            setErrorType(null);

            try {
                await subscribeToProgram(programId);
                // optional: refresh list if running UI depends on it
                // await load();
            } catch (e) {
                console.error("[usePrograms] subscribe failed", e);
                setErrorType("save");
                throw e;
            }
        },
        [baseUrl]
    );

    const getSubscriptionStatus = useCallback(async (programId: string) => {
        return await getProgramSubscriptionStatus(programId, baseUrl);
    }, [baseUrl]);

    const unsubscribe = useCallback(async (userProgramId: string) => {
        await unsubscribeFromProgram(userProgramId, baseUrl);
    }, [baseUrl]);

    return {
        programs,
        loading,
        errorType,
        reload: load,
        createProgram: create,
        subscribeToProgram: subscribe,
        unsubscribeFromProgram : unsubscribe,
        getSubscriptionStatus: getSubscriptionStatus,
    };

}

export type { ProgramItem } from "@/lib/api/program";
