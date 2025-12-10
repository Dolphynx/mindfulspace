/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

import { apiFetch } from "@/lib/api/client";

export type ExerciceContentItem = {
    id: string;
    name: string;
    Description: string;
    steps: {
        id: string;
        order: number;
        title: string | null;
        description: string;
        imageUrl: string | null;
    }[];
};

export type ExerciceSession = {
    id: string;
    date: string; // YYYY-MM-DD (already normalized by backend)
    quality: number | null;
    exercices: {
        exerciceContentId: string;
        exerciceContentName: string;
        repetitionCount: number;
    }[];
};

export type CreateExerciceSessionPayload = {
    dateSession: string; // ISO timestamp
    quality?: number;
    exercices: {
        exerciceContentId: string;
        repetitionCount: number;
    }[];
};

/* -------------------------------------------------------------------------- */
/*  CONFIG                                                                    */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  RAW BACKEND TYPES (untyped JSON → unknown)                                */
/* -------------------------------------------------------------------------- */

type RawExerciceSession = {
    id?: unknown;
    date?: unknown;
    quality?: unknown;
    exercices?: unknown;
};

type RawExerciceContent = {
    id?: unknown;
    name?: unknown;
    Description?: unknown;
    steps?: unknown;
};

/* -------------------------------------------------------------------------- */
/*  TYPE GUARDS                                                               */
/* -------------------------------------------------------------------------- */

function isRawExerciceSession(value: unknown): value is RawExerciceSession {
    if (!value || typeof value !== "object") return false;
    const v = value as RawExerciceSession;

    return (
        typeof v.id === "string" &&
        typeof v.date === "string" &&
        Array.isArray(v.exercices)
    );
}

function isRawExerciceContent(value: unknown): value is RawExerciceContent {
    if (!value || typeof value !== "object") return false;
    const v = value as RawExerciceContent;

    return (
        typeof v.id === "string" &&
        typeof v.name === "string" &&
        typeof v.Description === "string" &&
        Array.isArray(v.steps)
    );
}

/* -------------------------------------------------------------------------- */
/*  NORMALIZERS                                                               */
/* -------------------------------------------------------------------------- */

function normalizeExerciceSession(
    raw: RawExerciceSession
): ExerciceSession | null {
    if (!isRawExerciceSession(raw)) return null;

    const quality = typeof raw.quality === "number" ? raw.quality : null;

    const exercices = Array.isArray(raw.exercices)
        ? raw.exercices.map((e: any) => ({
            exerciceContentId: String(e.exerciceContentId ?? ""),
            exerciceContentName: String(e.exerciceContentName ?? ""),
            repetitionCount: Number(e.repetitionCount ?? 0),
        }))
        : [];

    return {
        id: String(raw.id),
        date: String(raw.date),
        quality,
        exercices,
    };
}

function normalizeExerciceContent(
    raw: RawExerciceContent
): ExerciceContentItem | null {
    if (!isRawExerciceContent(raw)) return null;

    const steps = Array.isArray(raw.steps)
        ? raw.steps
            .filter((s: any) => s && typeof s.order === "number")
            .map((s: any) => ({
                id: String(s.id ?? ""),
                order: Number(s.order),
                title: typeof s.title === "string" ? s.title : null,
                description: String(s.description ?? ""),
                imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : null,
            }))
        : [];

    return {
        id: String(raw.id),
        name: String(raw.name),
        Description: String(raw.Description),
        steps,
    };
}

/* -------------------------------------------------------------------------- */
/*  API CALLS                                                                 */
/* -------------------------------------------------------------------------- */

/** GET /exercices/last7days */
export async function fetchLastExerciceSessions(
    baseUrl = API_BASE_URL
): Promise<ExerciceSession[]> {
    const res = await apiFetch(`${baseUrl}/exercices/last7days`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeExerciceSession)
        .filter((s): s is ExerciceSession => s !== null);
}

/** GET /exercices/types */
export async function fetchExerciceContents(
    baseUrl = API_BASE_URL
): Promise<ExerciceContentItem[]> {
    const res = await apiFetch(`${baseUrl}/exercices/exercice-content`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeExerciceContent)
        .filter((t): t is ExerciceContentItem => t !== null);
}

/** POST /exercices */
export async function createExerciceSession(
    payload: CreateExerciceSessionPayload,
    baseUrl = API_BASE_URL
): Promise<void> {
    const res = await apiFetch(`${baseUrl}/exercices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
