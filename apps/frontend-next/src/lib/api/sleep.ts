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

export async function createSleepSession(
    payload: CreateSleepSessionPayload,
    baseUrl: string = API_BASE_URL,
): Promise<void> {
    const res = await apiFetch(`${baseUrl}/sleep`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create sleep session");
}
