/**
 * Convertit une durée exprimée en minutes en une chaîne lisible au format "XhYY".
 *
 * Règles de formatage :
 * - La valeur est bornée à un minimum de 0 minute.
 * - Les heures correspondent à la division entière par 60.
 * - Les minutes restantes sont toujours affichées sur deux chiffres.
 *
 * Exemples :
 * - `5`   → `"0h05"`
 * - `65`  → `"1h05"`
 * - `130` → `"2h10"`
 *
 * @param minutes - Durée en minutes.
 * @returns Durée formatée sous la forme `"XhYY"`.
 */
export function formatHoursMinutes(minutes: number): string {
    const safe = Math.max(0, minutes);
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${h}h${m.toString().padStart(2, "0")}`;
}
