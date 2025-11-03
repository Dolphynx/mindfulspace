// apps/frontend-next/lib/userPrefs.ts
export type UserPrefs = {
    launchBreathingOnStart: boolean;
};

/**
 * Appelle l’API Nest pour récupérer les préférences utilisateur
 * (GET /prefs)
 */
export async function getUserPrefs(): Promise<UserPrefs> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prefs`, {
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
        const prefs = (await res.json()) as Partial<UserPrefs>;

        return {
            launchBreathingOnStart:
                typeof prefs.launchBreathingOnStart === "boolean"
                    ? prefs.launchBreathingOnStart
                    : true,
        };
    } catch (e) {
        console.error("Erreur chargement prefs:", e);
        return { launchBreathingOnStart: true };
    }
}
