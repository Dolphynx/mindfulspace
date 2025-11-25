/**
 * Formate une durée exprimée en minutes en une chaîne lisible.
 *
 * Règles :
 * - Si la durée est inférieure à 60 min → format `X min`
 * - Si elle dépasse 60 min :
 *    - durée exacte en heures → `X h`
 *    - sinon → `X h Y min`
 *
 * Exemples :
 * - `45` → `"45 min"`
 * - `60` → `"1 h"`
 * - `75` → `"1 h 15 min"`
 *
 * @param min Durée totale en minutes.
 * @returns Chaîne lisible au format heures/minutes.
 */
export function formatDuration(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const rest = min % 60;
    return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}
