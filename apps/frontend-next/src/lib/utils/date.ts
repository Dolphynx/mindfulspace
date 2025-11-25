/**
 * Convertit une date provenant d’un `<input type="date">`
 * (au format `YYYY-MM-DD`) en une ISO string normalisée, en
 * plaçant volontairement l’heure à **12:00:00**.
 *
 * Raison :
 * - mettre l’heure à midi permet d’éviter un décalage UTC qui peut
 *   faire reculer la date d’un jour selon le fuseau horaire.
 * - c’est une technique courante pour stabiliser les dates "sans heure".
 *
 * @param dateStr Chaîne de date au format `YYYY-MM-DD` provenant d’un input HTML.
 * @returns Une chaîne ISO complète (ex: `2025-11-25T12:00:00.000Z`).
 */
export function dateInputToNoonIso(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date();
    date.setFullYear(y);
    date.setMonth(m - 1);
    date.setDate(d);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

/**
 * Formate une date simple `YYYY-MM-DD` en utilisant la locale
 * du navigateur via `toLocaleDateString()`.
 *
 * Exemples :
 * - `2025-03-01` → `01/03/2025` en fr-FR
 * - Le format dépend entièrement de la configuration utilisateur.
 *
 * @param dateStr Chaîne de date au format `YYYY-MM-DD`.
 * @returns Une représentation locale lisible de la date.
 */
export function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString();
}
