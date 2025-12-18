import {getDB} from "./db";

export type PendingSessionPayload = {
    value: number;
    quality: number | null;
    dateSession: string;
    sessionTypeId: string;
    expectedUnit?: string;
};

export async function queueSession(payload: PendingSessionPayload) {
    const db = await getDB();
    await db.add("pendingSessions", {
        payload,
        createdAt: Date.now(),
    });
}

export async function getQueuedSessions() {
    const db = await getDB();
    return db.getAll("pendingSessions");
}

export async function removeQueuedSession(id: number) {
    const db = await getDB();
    await db.delete("pendingSessions", id);
}
