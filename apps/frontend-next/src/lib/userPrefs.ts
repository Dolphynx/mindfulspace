// apps/frontend-next/lib/userPrefs.ts

/**
 * Type UserPrefs
 *
 * Représente les préférences locales de l’utilisateur récupérées via l’API Nest.
 *
 * - `launchBreathingOnStart` : détermine si l’exercice de respiration doit
 *   se lancer automatiquement lorsque l’utilisateur ouvre l’application.
 *
 * Ce type peut évoluer si d’autres préférences utilisateur sont ajoutées côté backend.
 */
export type UserPrefs = {
    launchBreathingOnStart: boolean;
};

/**
 * getUserPrefs
 *
 * Récupère les préférences utilisateur en appelant l’API Nest :
 *    GET /prefs
 *
 * Détails de fonctionnement :
 * - Utilise l’URL du backend via la variable NEXT_PUBLIC_API_URL.
 * - Désactive le cache (`cache: "no-store"`) pour garantir que les préférences
 *   sont toujours fraîches.
 * - Tolère les valeurs manquantes : si `launchBreathingOnStart` n’est pas une
 *   valeur booléenne, on applique le fallback `true`.
 *
 * Résilience :
 * - En cas d’erreur réseau, JSON invalide, ou code HTTP non-ok :
 *   → log dans la console
 *   → fallback `{ launchBreathingOnStart: true }`
 *
 * @returns Un objet UserPrefs cohérent, jamais partiellement défini.
 */
export async function getUserPrefs(): Promise<UserPrefs> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prefs`, {
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

        // On récupère partiellement les prefs, car l'API pourrait évoluer
        const prefs = (await res.json()) as Partial<UserPrefs>;

        return {
            launchBreathingOnStart:
                typeof prefs.launchBreathingOnStart === "boolean"
                    ? prefs.launchBreathingOnStart
                    : true, // fallback intelligent
        };
    } catch (e) {
        console.error("Erreur chargement prefs:", e);

        // fallback complet → garantit que la fonction retourne toujours un objet valide
        return { launchBreathingOnStart: true };
    }
}
