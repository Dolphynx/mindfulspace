import { getQueuedActions, removeQueuedAction } from "./sessionQueue";
import {createSleepSession, CreateSleepSessionPayload} from "@/lib/api/sleep";

export async function syncOfflineQueue() {
    if (!navigator.onLine) return;

    const items = await getQueuedActions();

    for (const item of items) {
        try {
            switch (item.type) {
                case "sleep":
                    await createSleepSession(item.payload as CreateSleepSessionPayload);
                    break;

                case "exercise":
                    // await createExerciseSession(...)
                    break;

                case "meditation":
                    // await createMeditationSession(...)
                    break;

                default:
                    throw new Error("Unknown offline queue type");
            }

            await removeQueuedAction(item.id!);
        } catch (e) {
            // stop syncing on first failure
            break;
        }
    }
}
