import { getQueuedActions, removeQueuedAction } from "./sessionQueue";
import {createSleepSession, CreateSleepSessionPayload} from "@/lib/api/sleep";

export async function syncOfflineQueue(baseUrl?: string) {
    if (!navigator.onLine) return;

    // Résolution explicite de l’URL de base de l’API pour la synchronisation offline.
    //
    // Priorité :
    // 1) `baseUrl` passé par l’appelant (ex: OfflineSyncListener)
    // 2) Variable d’environnement NEXT_PUBLIC_API_URL injectée au build
    //
    // Cette résolution explicite évite toute ambiguïté entre les différents
    // points d’entrée (runtime / build / fallback).
    const resolvedBaseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_URL;

    // Garde-fou : en production, l’URL de l’API DOIT être définie.
    // On échoue immédiatement si ce n’est pas le cas afin d’éviter
    // des comportements silencieux et difficiles à diagnostiquer.
    if (!resolvedBaseUrl) {
        throw new Error("syncOfflineQueue: missing NEXT_PUBLIC_API_URL / baseUrl");
    }

    // Garde-fou supplémentaire : en production, on refuse explicitement
    // toute URL pointant vers `localhost`.
    // Sur mobile/PWA, `localhost` fait référence à l’appareil lui-même
    // et provoquerait des échecs réseau silencieux.
    if (process.env.NODE_ENV === "production" && resolvedBaseUrl.includes("localhost")) {
       throw new Error(`syncOfflineQueue: refusing localhost baseUrl in production (${resolvedBaseUrl})`);
    }

    const items = await getQueuedActions();

    for (const item of items) {
        try {
            switch (item.type) {
                case "sleep":
                    await createSleepSession(
                        item.payload as CreateSleepSessionPayload,
                        resolvedBaseUrl
                    );
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
