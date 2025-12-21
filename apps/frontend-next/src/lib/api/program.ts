/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

import { apiFetch } from "@/lib/api/client";

export type ProgramExerciceItem = {
    id: string;
    defaultRepetitionCount: number | null;
    defaultSets: number | null;
    exercice: {
        id: string;
        name: string;
        description: string | null;
    };
};

export type ProgramDay = {
    id: string;
    title: string;
    order: number;
    weekday: number | null;
    exercices: ProgramExerciceItem[];
};

export type ProgramItem = {
    id: string;
    title: string;
    description: string | null;
    days: ProgramDay[];
};


export type UserProgram = {
    id: string;
    title: string;
    description: string | null;
    days: UserProgramDay[];
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

// Types for the user’s copied programs
export type UserProgramExercise = {
    id: string;
    exerciceContentName: string;
    defaultRepetitionCount: number | null;
};

export type UserProgramDay = {
    id: string;
    title: string;
    weekday: number | null;
    exercices: UserProgramExercise[];
};

export type ProgramSubscriptionStatus = {
    subscribed: boolean;
    userProgramId: string | null;
};

/* -------------------------------------------------------------------------- */
/*  CONFIG                                                                    */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  NORMALIZERS                                                               */
/* -------------------------------------------------------------------------- */

function withLang(url: string, lang: string) {
    const u = new URL(url);
    u.searchParams.set("lang", lang);
    return u.toString();
}


function normalizeProgram(raw: any): ProgramItem | null {
    if (!raw || typeof raw !== "object") return null;

    return {
        id: String(raw.id),
        title: String(raw.title),
        description: raw.description ?? null,
        days: Array.isArray(raw.days)
            ? raw.days.map((d: any) => ({
                id: String(d.id),
                title: String(d.title),
                order: Number(d.order),
                weekday: d.weekday ?? null,
                exercices: Array.isArray(d.exercices)
                    ? d.exercices.map((e: any) => ({
                        id: String(e.id),
                        defaultRepetitionCount: e.defaultRepetitionCount ?? null,
                        defaultSets: e.defaultSets ?? null,
                        exercice: {
                            id: String(e.exercice.id),
                            name: String(e.exercice.name),
                            description: e.exercice.description ?? null,
                        },
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
    lang: string,
    baseUrl = API_BASE_URL,
): Promise<ProgramItem[]> {
    const res = await apiFetch(withLang(`${baseUrl}/programs`, lang));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeProgram)
        .filter((p): p is ProgramItem => p !== null);
}

export async function fetchProgramById(
    id: string,
    lang: string,
    baseUrl = API_BASE_URL,
): Promise<ProgramItem | null> {
    const res = await apiFetch(withLang(`${baseUrl}/programs/${id}`, lang));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return normalizeProgram(await res.json());
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
    programId: string
): Promise<void> {
    const res = await apiFetch(
        `${API_BASE_URL}/programs/${programId}/subscribe`,
        {
            method: "POST",
        }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}


export async function getProgramSubscriptionStatus(
    programId: string,
): Promise<ProgramSubscriptionStatus> {
    const res = await apiFetch(
        `${API_BASE_URL}/user-programs/status/${programId}`
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}


export async function unsubscribeFromProgram(
    userProgramId: string,
): Promise<void> {
    const res = await apiFetch(
        `${API_BASE_URL}/user-programs/${userProgramId}`,
        { method: "DELETE" }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}


/**
 * GET /user/programs  (fetch all subscriptions of current user)
 */
export async function fetchUserPrograms(
    lang: string,
    baseUrl = API_BASE_URL,
): Promise<UserProgram[]> {
    const res = await apiFetch(withLang(`${baseUrl}/user-programs`, lang), {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return (await res.json()) as UserProgram[];
}

