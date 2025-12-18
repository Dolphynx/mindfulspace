import {
    getQueuedSessions,
    removeQueuedSession,
} from "./sessionQueue";

export async function syncPendingSessions(baseUrl: string) {
    if (!navigator.onLine) return;

    const pending = await getQueuedSessions();

    for (const item of pending) {
        try {
            const res = await fetch(`${baseUrl}/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item.payload),
            });

            if (!res.ok) throw new Error("Sync failed");

            await removeQueuedSession(item.id);
        } catch {
            // Stop syncing if one fails (network flapping)
            break;
        }
    }
}
