import type { SleepSession } from "@/lib/api/sleep";
import { getDB, type OfflineSleepHistoryItem } from "@/offline-sync/db";

const STORE = "sleepHistory";

function toHistoryItem(s: SleepSession): OfflineSleepHistoryItem {
    return {
        date: s.date,
        hours: s.hours,
        quality: s.quality,
    };
}

export async function saveSleepHistory(sessions: SleepSession[]) {
    const db = await getDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    for (const s of sessions) {
        await store.put(toHistoryItem(s));
    }

    await tx.done;
}

export async function getSleepHistory(lastDays: number): Promise<SleepSession[]> {
    const db = await getDB();
    const all = (await db.getAll(STORE)) as OfflineSleepHistoryItem[];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lastDays);

    return all
        .filter((s) => new Date(s.date) >= cutoff)
        .map((s) => ({
            id: s.date,
            date: s.date,
            hours: s.hours,
            quality: s.quality,
        }));
}

export async function upsertSleepHistoryItem(
    item: OfflineSleepHistoryItem,
) {
    const db = await getDB();
    await db.put(STORE, item);
}

