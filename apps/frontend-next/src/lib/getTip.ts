/**
 * getTip
 *
 * Récupère un "tip" (conseil bien-être) depuis l’API Nest.
 *
 * Fonctionnement :
 * - Appelle l’endpoint `/tips/random` du backend (URL fournie via NEXT_PUBLIC_API_URL).
 * - Désactive le cache (`cache: "no-store"`) pour garantir que chaque appel
 *   récupère un conseil frais.
 * - Si la réponse est valide, retourne `data.tip`.
 * - En cas d’erreur (réseau, JSON invalide, statut HTTP != 200…), la fonction
 *   retourne un message par défaut.
 *
 * Avantage :
 * - API simple, robuste et prête à être utilisée dans n’importe quel composant UI.
 */
export async function getTip(): Promise<string> {
    try {
        // Construction de l’URL absolue à partir de la variable d’environnement
        const url = `${process.env.NEXT_PUBLIC_API_URL}/tips/random`;

        // Appel API en mode "no-store" → pas de cache Next.js
        const res = await fetch(url, { cache: "no-store" });

        // Vérification du statut HTTP
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        // Parsing JSON
        const data = await res.json();

        // Retourne le tip si présent, sinon fallback
        return data.tip ?? "Prenez une grande respiration et souriez 🌿";
    } catch (e) {
        // Sécurité : fallback en cas de n'importe quel problème
        return "Prenez une grande respiration et souriez 🌿";
    }
}
