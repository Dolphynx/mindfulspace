export type MeditationSession = {
    date: string; // "YYYY-MM-DD"
    duration: number;
    quality: number | null;
};

export type CreateMeditationSessionPayload = {
    duration: number;
    quality?: number | null;
    dateSession: string; // ISO string
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Récupère les 7 dernières séances de méditation.
 */
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

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .filter(
            (s) =>
                s &&
                typeof s === "object" &&
                typeof (s as any).date === "string" &&
                typeof (s as any).duration === "number",
        )
        .map((s: any) => ({
            date: s.date as string,
            duration: s.duration as number,
            quality:
                s.quality === null || s.quality === undefined
                    ? null
                    : Number(s.quality),
        }));
}

/**
 * Crée une nouvelle séance de méditation.
 */
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
