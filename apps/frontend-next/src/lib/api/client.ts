/**
 * URL de base de l’API côté frontend.
 *
 * - En environnement local, on utilise par défaut `http://localhost:3001`.
 * - En production/staging, `NEXT_PUBLIC_API_URL` doit être fourni via l’ENV.
 *
 * Cette valeur est utilisée pour préfixer les chemins relatifs envoyés via
 * {@link apiFetch}.
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Wrapper sécurisé autour de {@link fetch} pour communiquer avec l'API backend.
 *
 * Ce petit client fournit plusieurs garanties utiles :
 *
 * ### 1. Gestion automatique de l’URL
 * - Si `input` est **une URL absolue** (ex. `"https://api..."`), elle est utilisée telle quelle.
 * - Si `input` est **un chemin relatif** (ex. `"/meditation/last7days"`),
 *   il est automatiquement préfixé par {@link API_BASE_URL}.
 *
 * ### 2. Cookies toujours envoyés
 * Tous les appels incluent les cookies (`credentials: "include"`)
 * afin de transmettre le cookie de session (JWT, token signé, etc.).
 *
 * ### 3. En-têtes unifiés
 * Ajoute automatiquement `Content-Type: application/json`, sauf si surchargé.
 *
 * ### Exemple
 * ```ts
 * const res = await apiFetch("/meditation/types");
 * if (!res.ok) throw new Error("Erreur API");
 * const data = await res.json();
 * ```
 *
 * @param input URL absolue ou chemin relatif vers une ressource API.
 * @param init Options fetch standard. Les clés fournies ici surchargent les valeurs par défaut.
 * @returns La promesse d’un objet {@link Response}.
 */
export async function apiFetch(
    input: string,
    init: RequestInit = {},
): Promise<Response> {
    // Détecte si l'URL fournie est absolue (commence par http:// ou https://)
    const isAbsoluteUrl = /^https?:\/\//i.test(input);

    // Construit l'URL finale (absolue telle quelle, relative + BASE_URL sinon)
    const url = isAbsoluteUrl ? input : `${API_BASE_URL}${input}`;

    return fetch(url, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
    });
}
