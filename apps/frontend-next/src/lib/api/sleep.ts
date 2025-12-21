import {apiFetch} from "@/lib/api/client";

export type SleepSession = {
    id: string;
    date: string;
    hours: number;
    quality?: number;
};

export type CreateSleepSessionPayload = {
    dateSession: string;
    hours: number;
    quality?: number;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";


export async function fetchLastSleepSessions(baseUrl: string = API_BASE_URL,): Promise<SleepSession[]> {
    const res = await apiFetch(`${baseUrl}/sleep/last7days`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load sleep sessions");
    return res.json();
}

export type CreateSleepSessionResponse = {
    session: unknown;
    newBadges?: unknown[];
};

export async function createSleepSession(
    payload: CreateSleepSessionPayload,
    baseUrl: string = API_BASE_URL,
): Promise<CreateSleepSessionResponse> {
    const res = await apiFetch(`${baseUrl}/sleep`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to create sleep session");

    return res.json() as Promise<CreateSleepSessionResponse>;
}

export type SleepSessionsDetailQuery =
    | { lastDays: number }
    | { from: string; to?: string }
    | { to: string; from?: string };

export async function fetchSleepSessionsDetail(
    query: SleepSessionsDetailQuery = { lastDays: 30 },
    baseUrl: string = API_BASE_URL,
): Promise<SleepSession[]> {
    const params = new URLSearchParams();

    if ("lastDays" in query) {
        params.set("lastDays", String(query.lastDays));
    } else {
        if (query.from) params.set("from", query.from);
        if (query.to) params.set("to", query.to);
    }

    const res = await apiFetch(`${baseUrl}/sleep/me/sessions?${params.toString()}`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to load sleep sessions (detail)");

    const data = (await res.json()) as unknown;

    // on reste permissif: backend renvoie souvent {date, hours, quality} sans id
    if (!Array.isArray(data)) return [];

    return data.map((s: any) => ({
        id: typeof s?.id === "string" ? s.id : String(s?.date ?? crypto.randomUUID()),
        date: String(s?.date ?? ""),
        hours: Number(s?.hours ?? 0),
        quality: s?.quality == null ? undefined : Number(s.quality),
    })) as SleepSession[];
}
