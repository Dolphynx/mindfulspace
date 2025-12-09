"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchWorkoutPrograms,
    createWorkoutProgram,
    type WorkoutPrograms,
    type CreateWorkoutProgramPayload,
} from "@/lib/api/workout-programs";

export type WorkoutProgramsErrorType = "load" | "save" | "single" | null;

export function useWorkoutPrograms(baseUrl?: string) {
    const [programs, setPrograms] = useState<WorkoutPrograms[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<WorkoutProgramsErrorType>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErrorType(null);

        try {
            const data = await fetchWorkoutPrograms(baseUrl);
            setPrograms(data);
        } catch (e) {
            console.error("[useWorkoutPrograms] load failed", e);
            setErrorType("load");
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (payload: CreateWorkoutProgramPayload) => {
            setErrorType(null);

            try {
                await createWorkoutProgram(payload, baseUrl);
                await load();
            } catch (e) {
                console.error("[useWorkoutPrograms] save failed", e);
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

export type { WorkoutPrograms } from "@/lib/api/workout-programs";
