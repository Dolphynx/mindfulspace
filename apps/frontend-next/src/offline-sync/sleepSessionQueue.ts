/*
import { getDB, type OfflineSleepSession } from "./db";

export async function savePendingSleepSession(
    payload: Omit<OfflineSleepSession, "id" | "createdAt">,
) {
    const db = await getDB();

    await db.add("sleepSessions", {
        ...payload,
        createdAt: new Date().toISOString(),
    });
}
*/
