export type MeditationTypeItem = {
    id: string;
    slug: string;
    //name: string;
};

export type MeditationSession = {
    date: string;            // YYYY-MM-DD
    durationSeconds: number;
    moodAfter: number | null;
    meditationTypeId: string | null;
};

export type CreateMeditationSessionPayload = {
    //userId: string;
    durationSeconds: number;      // seconds
    moodAfter?: number | null;
    dateSession: string;          // ISO
    meditationTypeId: string;     // REQUIRED for V1 clean
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* -------------------------------------------------------------------------- */
/*  TYPES : réponses BACKEND "brutes"                                         */
/* -------------------------------------------------------------------------- */

type RawMeditationSummary = {
    date?: unknown;
    durationSeconds?: unknown;
    moodAfter?: unknown;
    meditationTypeId?: unknown;
};

function isRawMeditationSummary(
    value: unknown,
): value is RawMeditationSummary {
    if (!value || typeof value !== "object") return false;
    const v = value as RawMeditationSummary;
    return (
        typeof v.date === "string" &&
        typeof v.durationSeconds === "number"
    );
}

function normalizeMeditationSummary(
    raw: RawMeditationSummary,
): MeditationSession | null {
    if (typeof raw.date !== "string") return null;
    if (typeof raw.durationSeconds !== "number") return null;

    const moodAfter =
        typeof raw.moodAfter === "number" ? raw.moodAfter : null;

    return {
        date: raw.date,
        durationSeconds: raw.durationSeconds,
        moodAfter,
        meditationTypeId:
            typeof raw.meditationTypeId === "string"
                ? raw.meditationTypeId
                : null,
    };
}

/* -------------------------------------------------------------------------- */
/*  GET /meditation/last7days                                                 */
/* -------------------------------------------------------------------------- */
export async function fetchLastMeditationSessions(
    baseUrl: string = API_BASE_URL,
): Promise<MeditationSession[]> {
    const res = await fetch(`${baseUrl}/meditation/last7days`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as unknown;

    if (!Array.isArray(data)) return [];

    return data
        .filter(isRawMeditationSummary)
        .map(normalizeMeditationSummary)
        .filter((s): s is MeditationSession => s !== null);
}

/* -------------------------------------------------------------------------- */
/*  GET /meditation/types                                                     */
/* -------------------------------------------------------------------------- */
export async function fetchMeditationTypes(
    baseUrl = API_BASE_URL,
): Promise<MeditationTypeItem[]> {
    const res = await fetch(`${baseUrl}/meditation/types`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch meditation types");
    }

    return res.json();
}

/* -------------------------------------------------------------------------- */
/*  POST /meditation                                                          */
/* -------------------------------------------------------------------------- */
export async function createMeditationSession(
    payload: CreateMeditationSessionPayload,
    baseUrl: string = API_BASE_URL,
): Promise<void> {
    const res = await fetch(`${baseUrl}/meditation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
}
