// lib/offline/sleep.ts
import { queueAction } from "./sessionQueue";
import type { OfflineSleepSession } from "./db";

export function queueSleepSession(
    payload: Omit<OfflineSleepSession, "id" | "createdAt">,
) {
    return queueAction("sleep", payload);
}
