/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

import { apiFetch } from "@/lib/api/client";

export type WorkoutPrograms = {
    id: string;
    title: string;
    description: string | null;
    days: WorkoutProgramDay[];
}

export type WorkoutProgramDay = {
    id: string;
    title: string;
    order: number;
    weekday: number | null;
    exercices: WorkoutProgramExercise[];
}

export type WorkoutProgramExercise = {
    id: string;
    exerciceTypeId: string;
    defaultRepetitionCount: number | null;
    defaultSets: number | null;

    exerciceType: {
        id: string;
        name: string;
        description?: string | null;
    } | null;
};


export type CreateWorkoutProgramPayload = {
    title: string;
    description?: string;
    days: {
        title: string;
        order: number;
        weekday?: number;
        exercices: {
            exerciceTypeId: string;
            defaultRepetitionCount?: number;
            defaultSets?: number;
        }[];
    }[];
}

/* -------------------------------------------------------------------------- */
/*  CONFIG                                                                    */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  RAW TYPES (untyped JSON)                                                  */
/* -------------------------------------------------------------------------- */

type RawWorkoutProgram = any; // you could apply shape checking later

/* -------------------------------------------------------------------------- */
/*  NORMALIZERS                                                               */
/* -------------------------------------------------------------------------- */

function normalizeWorkoutProgram(raw: any): WorkoutPrograms | null {
    if (!raw || typeof raw !== "object") return null;

    return {
        id: String(raw.id ?? ""),
        title: String(raw.title ?? ""),
        description: typeof raw.description === "string" ? raw.description : null,
        days: Array.isArray(raw.days)
            ? raw.days.map((d: any) => ({
                id: String(d.id ?? ""),
                title: String(d.title ?? ""),
                order: Number(d.order ?? 0),
                weekday: typeof d.weekday === "number" ? d.weekday : null,
                exercices: Array.isArray(d.exercices)
                    ? d.exercices.map((e: any) => ({
                        id: String(e.id ?? ""),
                        exerciceTypeId: String(e.exerciceTypeId ?? ""),
                        defaultRepetitionCount:
                            typeof e.defaultRepetitionCount === "number"
                                ? e.defaultRepetitionCount
                                : null,
                        defaultSets:
                            typeof e.defaultSets === "number"
                                ? e.defaultSets
                                : null,
                        exerciceType: e.exerciceType
                            ? {
                                id: String(e.exerciceType.id ?? ""),
                                name: String(e.exerciceType.name ?? ""),
                                description:
                                    typeof e.exerciceType.description === "string"
                                        ? e.exerciceType.description
                                        : null,
                            }
                            : null,
                    }))
                    : [],

            }))
            : [],
    };
}

/* -------------------------------------------------------------------------- */
/*  API CALLS                                                                 */
/* -------------------------------------------------------------------------- */

export async function fetchWorkoutPrograms(
    baseUrl = API_BASE_URL,
): Promise<WorkoutPrograms[]> {
    const res = await apiFetch(`${baseUrl}/programs/workout`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeWorkoutProgram)
        .filter((p): p is WorkoutPrograms => p !== null);
}

export async function fetchWorkoutProgramById(
    id: string,
    baseUrl = API_BASE_URL,
): Promise<WorkoutPrograms | null> {
    const res = await apiFetch(`${baseUrl}/programs/workout/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    return normalizeWorkoutProgram(raw);
}

export async function createWorkoutProgram(
    payload: CreateWorkoutProgramPayload,
    baseUrl = API_BASE_URL,
): Promise<WorkoutPrograms | null> {
    const res = await apiFetch(`${baseUrl}/programs/workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    return normalizeWorkoutProgram(raw);
}
