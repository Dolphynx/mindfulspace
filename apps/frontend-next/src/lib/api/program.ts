/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

import { apiFetch } from "@/lib/api/client";

export type ProgramItem = {
    id: string;
    title: string;
    description: string | null;
    days: ProgramDay[];
};

export type ProgramDay = {
    id: string;
    title: string;
    order: number;
    weekday: number | null;
    exerciceItems: ProgramExerciceItem[];
};

export type ProgramExerciceItem = {
    id: string;
    exerciceContentId: string;
    defaultRepetitionCount: number | null;
    defaultSets: number | null;

    exerciceContent: {
        id: string;
        name: string;
        description?: string | null;
    } | null;
};

export type CreateProgramPayload = {
    title: string;
    description?: string;
    days: {
        title: string;
        order: number;
        weekday?: number;
        exerciceItems: {
            exerciceContentId: string;
            defaultRepetitionCount?: number;
            defaultSets?: number;
        }[];
    }[];
};

/* -------------------------------------------------------------------------- */
/*  CONFIG                                                                    */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  NORMALIZERS                                                               */
/* -------------------------------------------------------------------------- */

function normalizeProgram(raw: any): ProgramItem | null {
    if (!raw || typeof raw !== "object") return null;

    return {
        id: String(raw.id ?? ""),
        title: String(raw.title ?? ""),
        description:
            typeof raw.description === "string" ? raw.description : null,
        days: Array.isArray(raw.days)
            ? raw.days.map((d: any) => ({
                id: String(d.id ?? ""),
                title: String(d.title ?? ""),
                order: Number(d.order ?? 0),
                weekday: typeof d.weekday === "number" ? d.weekday : null,
                exerciceItems: Array.isArray(d.exerciceItems)
                    ? d.exerciceItems.map((e: any) => ({
                        id: String(e.id ?? ""),
                        exerciceContentId: String(e.exerciceContentId ?? ""),
                        defaultRepetitionCount:
                            typeof e.defaultRepetitionCount === "number"
                                ? e.defaultRepetitionCount
                                : null,
                        defaultSets:
                            typeof e.defaultSets === "number"
                                ? e.defaultSets
                                : null,
                        exerciceContent: e.exerciceContent
                            ? {
                                id: String(e.exerciceContent.id ?? ""),
                                name: String(e.exerciceContent.name ?? ""),
                                description:
                                    typeof e.exerciceContent.description === "string"
                                        ? e.exerciceContent.description
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

export async function fetchPrograms(
    baseUrl = API_BASE_URL
): Promise<ProgramItem[]> {
    const res = await apiFetch(`${baseUrl}/programs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeProgram)
        .filter((p): p is ProgramItem => p !== null);
}

export async function fetchProgramById(
    id: string,
    baseUrl = API_BASE_URL
): Promise<ProgramItem | null> {
    const res = await apiFetch(`${baseUrl}/programs/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    return normalizeProgram(raw);
}

export async function createProgram(
    payload: CreateProgramPayload,
    baseUrl = API_BASE_URL
): Promise<ProgramItem | null> {
    const res = await apiFetch(`${baseUrl}/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    return normalizeProgram(raw);
}
