import {getDB, OfflineQueueItem} from "./db";

export async function queueAction(
    type: OfflineQueueItem["type"],
    payload: unknown,
) {
    const db = await getDB();

    await db.add("offlineQueue", {
        type,
        payload,
        createdAt: Date.now(),
    });
}

export async function getQueuedActions() {
    const db = await getDB();
    return db.getAll("offlineQueue");
}

export async function removeQueuedAction(id: number) {
    const db = await getDB();
    await db.delete("offlineQueue", id);
}
