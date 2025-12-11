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
    sleepItems: ProgramSleepItem[];
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

export type ProgramSleepItem = {
    id: string;
    defaultHours: number | null;
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
        sleepItems: {
            defaultHours: number | null;
        }
    }[];
};


// Types for the user’s copied programs
export type UserProgramExercise = {
    id: string;
    exerciceContentName: string;
    defaultRepetitionCount: number | null;
};

export type UserProgramSleep = {
    id: string;
    hours: number | null;
};

export type UserProgramDay = {
    id: string;
    title: string;
    weekday: number | null;
    exercices: UserProgramExercise[];
    sleepItems: UserProgramSleep[];
};

export type UserProgram = {
    id: string;
    programTitle: string;
    days: UserProgramDay[];
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

    console.log(raw)

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
                sleepItems: []
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

    console.log(data)

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

/**
 * POST /user/programs  (subscribe current user to a program)
 * body: { programId: string }
 */
export async function subscribeToProgram(
    programId: string,
    baseUrl = API_BASE_URL
): Promise<void> {
    const res = await apiFetch(`${baseUrl}/user/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function getProgramSubscriptionStatus(programId: string, baseUrl = API_BASE_URL) {
    const res = await apiFetch(`${baseUrl}/user/programs/status/${programId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
        subscribed: boolean;
        userProgramId: string | null;
    };

    return data; // not just boolean
}

export async function unsubscribeFromProgram(userProgramId: string, baseUrl = API_BASE_URL) {
    const res = await apiFetch(`${baseUrl}/user/programs/${userProgramId}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * GET /user/programs  (fetch all subscriptions of current user)
 */
export async function fetchUserPrograms(
    baseUrl = API_BASE_URL,
): Promise<UserProgram[]> {
    const res = await apiFetch(`${baseUrl}/user/programs`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    console.log(data);

    return data.map((raw: any): UserProgram => ({
        id: String(raw.id ?? ""),
        programTitle: String(raw.program?.title ?? ""), // 👈 from relation
        days: Array.isArray(raw.days)
            ? raw.days.map((d: any): UserProgramDay => ({
                id: String(d.id ?? ""),
                title: String(d.title ?? ""),
                weekday:
                    typeof d.weekday === "number" ? d.weekday : null,
                exercices: Array.isArray(d.exercices)
                    ? d.exercices.map((e: any): UserProgramExercise => ({
                        id: String(e.id ?? ""),
                        exerciceContentName: String(e.exerciceContent?.name ?? ""),
                        defaultRepetitionCount:
                            typeof e.defaultRepetitionCount === "number"
                                ? e.defaultRepetitionCount
                                : null,
                    }))
                    : [],
                sleepItems: Array.isArray(d.sleepItems)
                    ? d.sleepItems.map((s: any): UserProgramSleep => ({
                        id: String(s.id ?? ""),
                        hours: typeof s.hours === "number" ? s.hours : null,
                    }))
                    : [],
            }))
            : [],
    }));
}






