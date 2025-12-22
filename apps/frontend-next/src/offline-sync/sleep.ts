// lib/offline/sleep.ts
import { queueAction } from "./sessionQueue";
import type { OfflineSleepSession } from "./db";
import { upsertSleepHistoryItem } from "./sleepHistory";

export async function queueSleepSession(
    payload: Omit<OfflineSleepSession, "id" | "createdAt">,
) {
    await queueAction("sleep", payload);

    await upsertSleepHistoryItem({
        date: payload.dateSession.slice(0, 10), // YYYY-MM-DD
        hours: payload.hours,
        quality: payload.quality,
    });
}
