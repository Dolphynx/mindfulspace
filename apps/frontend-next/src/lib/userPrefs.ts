/**
 * Type UserPrefs
 *
 * Représente des préférences utilisateur récupérées via l’API Nest.
 *
 * @remarks
 * Les préférences définies ici ont été introduites lors d’une phase
 * de prototypage afin de tester une fonctionnalité envisagée
 * (ex. déclenchement automatique d’une séance de respiration au démarrage).
 *
 * Cette fonctionnalité a ensuite été abandonnée, mais la structure
 * de préférences est conservée :
 * - pour documenter les choix explorés,
 * - pour faciliter une éventuelle réactivation ou évolution future,
 * - et pour maintenir une cohérence avec l’API existante.
 */
export type UserPrefs = {
    /**
     * Indique si une séance de respiration devait se lancer automatiquement
     * à l’ouverture de l’application.
     *
     * @remarks
     * Préférence utilisée à des fins de test lors d’une phase d’essai,
     * non exploitée dans la version finale de l’application.
     */
    launchBreathingOnStart: boolean;
};

/**
 * getUserPrefs
 *
 * Récupère les préférences utilisateur via l’API Nest :
 *    GET /prefs
 *
 * @remarks
 * Cet appel faisait partie d’une implémentation expérimentale destinée
 * à simuler des préférences utilisateur pour tester des parcours et
 * des comportements applicatifs avant validation fonctionnelle.
 *
 * Bien que la fonctionnalité associée ait été abandonnée, la fonction
 * est conservée afin de :
 * - préserver la compatibilité avec l’API backend,
 * - documenter le travail exploratoire réalisé,
 * - et servir de base si des préférences utilisateur sont réintroduites.
 *
 * Détails techniques :
 * - Utilise l’URL du backend via `NEXT_PUBLIC_API_URL`.
 * - Désactive le cache (`cache: "no-store"`) pour garantir des données fraîches.
 * - Tolère les valeurs manquantes ou invalides via des fallbacks sûrs.
 *
 * Résilience :
 * - En cas d’erreur réseau, JSON invalide ou réponse non valide :
 *   → log console
 *   → fallback `{ launchBreathingOnStart: true }`
 *
 * @returns Un objet `UserPrefs` toujours valide et cohérent.
 */
export async function getUserPrefs(): Promise<UserPrefs> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prefs`, {
            cache: "no-store",
        });

        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

        // Récupération partielle pour anticiper l’évolution de l’API
        const prefs = (await res.json()) as Partial<UserPrefs>;

        return {
            launchBreathingOnStart:
                typeof prefs.launchBreathingOnStart === "boolean"
                    ? prefs.launchBreathingOnStart
                    : true, // fallback conservateur issu de la phase de prototypage
        };
    } catch (e) {
        console.error("Erreur chargement prefs:", e);

        // Fallback complet garantissant un retour toujours valide
        return { launchBreathingOnStart: true };
    }
}
