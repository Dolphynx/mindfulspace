/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

export type WorkoutTypeItem = {
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

export type WorkoutSession = {
    id: string;
    date: string;            // YYYY-MM-DD (already normalized by backend)
    quality: number | null;
    exercices: {
        exerciceTypeId: string;
        exerciceTypeName: string;
        repetitionCount: number;
    }[];
};

export type CreateWorkoutSessionPayload = {
    dateSession: string;     // ISO timestamp
    quality?: number;
    exercices: {
        exerciceTypeId: string;
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

type RawWorkoutSession = {
    id?: unknown;
    date?: unknown;
    quality?: unknown;
    exercices?: unknown;
};

type RawWorkoutType = {
    id?: unknown;
    name?: unknown;
    Description?: unknown;
    steps?: unknown;
};

/* -------------------------------------------------------------------------- */
/*  TYPE GUARDS                                                               */
/* -------------------------------------------------------------------------- */

function isRawWorkoutSession(value: unknown): value is RawWorkoutSession {
    if (!value || typeof value !== "object") return false;
    const v = value as RawWorkoutSession;

    return (
        typeof v.id === "string" &&
        typeof v.date === "string" &&
        Array.isArray(v.exercices)
    );
}

function isRawWorkoutType(value: unknown): value is RawWorkoutType {
    if (!value || typeof value !== "object") return false;
    const v = value as RawWorkoutType;

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

function normalizeWorkoutSession(
    raw: RawWorkoutSession,
): WorkoutSession | null {
    if (!isRawWorkoutSession(raw)) return null;

    const quality =
        typeof raw.quality === "number" ? raw.quality : null;

    const exercices = Array.isArray(raw.exercices)
        ? raw.exercices
            .map((e: any) => ({
                exerciceTypeId: String(e.exerciceTypeId ?? ""),
                exerciceTypeName: String(e.exerciceTypeName ?? ""),
                repetitionCount: Number(e.repetitionCount ?? 0),
            }))
        : [];

    return {
        id: raw.id,
        date: raw.date,
        quality,
        exercices,
    };
}

function normalizeWorkoutType(
    raw: RawWorkoutType,
): WorkoutTypeItem | null {
    if (!isRawWorkoutType(raw)) return null;

    const steps = raw.steps
        .filter((s: any) => typeof s.order === "number")
        .map((s: any) => ({
            id: String(s.id ?? ""),
            order: Number(s.order),
            title: typeof s.title === "string" ? s.title : null,
            description: String(s.description ?? ""),
            imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : null,
        }));

    return {
        id: raw.id,
        name: raw.name,
        Description: raw.Description,
        steps,
    };
}

/* -------------------------------------------------------------------------- */
/*  API CALLS                                                                 */
/* -------------------------------------------------------------------------- */

/** GET /workouts/last7days */
export async function fetchLastWorkoutSessions(
    baseUrl = API_BASE_URL,
): Promise<WorkoutSession[]> {
    const res = await fetch(`${baseUrl}/workouts/last7days`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeWorkoutSession)
        .filter((s): s is WorkoutSession => s !== null);
}

/** GET /workouts/exercice-types */
export async function fetchWorkoutTypes(
    baseUrl = API_BASE_URL,
): Promise<WorkoutTypeItem[]> {
    const res = await fetch(`${baseUrl}/workouts/exercice-types`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return [];

    return data
        .map(normalizeWorkoutType)
        .filter((t): t is WorkoutTypeItem => t !== null);
}

/** POST /workouts */
export async function createWorkoutSession(
    payload: CreateWorkoutSessionPayload,
    baseUrl = API_BASE_URL,
): Promise<void> {
    const res = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
