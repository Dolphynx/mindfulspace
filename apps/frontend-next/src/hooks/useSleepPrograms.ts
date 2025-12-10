/*
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchPrograms,
    createProgram,
    type ProgramItem,
    type CreateProgramPayload,
} from "@/lib/api/program";

export type ProgramErrorType = "load" | "save" | "single" | null;

export function usePrograms(baseUrl?: string) {
    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<ProgramErrorType>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchPrograms(baseUrl);
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

    return {
        programs,
        loading,
        errorType,
        reload: load,
        createProgram: create,
    };
}

export type { ProgramItem } from "@/lib/api/program";
*/
