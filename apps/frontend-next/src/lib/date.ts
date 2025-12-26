/**
 * Formate une date en YYYY-MM-DD (date locale, sans heure).
 *
 * @remarks
 * - Utilise le fuseau horaire local du navigateur.
 * - Adapté aux champs "date-only" côté backend (Postgres DATE).
 *
 * @param date - Date à formater (par défaut : maintenant)
 * @returns Date formatée YYYY-MM-DD
 */
export function formatLocalYYYYMMDD(date: Date = new Date()): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}
