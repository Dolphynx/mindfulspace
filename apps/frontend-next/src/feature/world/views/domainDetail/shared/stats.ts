/**
 * Représente une clé de jour normalisée au format ISO simplifié.
 *
 * Format attendu : `"YYYY-MM-DD"`.
 *
 * Ce format est utilisé pour :
 * - la comparaison lexicographique (ordre chronologique),
 * - le calcul de streaks,
 * - la déduplication des jours.
 */
type DayKey = string; // "YYYY-MM-DD"

/**
 * Convertit un objet `Date` en clé de jour (`DayKey`).
 *
 * La conversion :
 * - utilise l’année, le mois et le jour locaux,
 * - applique un padding sur 2 chiffres pour le mois et le jour.
 *
 * @param d - Date à convertir.
 * @returns Clé de jour au format `"YYYY-MM-DD"`.
 */
export function toDayKey(d: Date): DayKey {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convertit une clé de jour (`DayKey`) en objet `Date`.
 *
 * Hypothèse :
 * - La chaîne est au format `"YYYY-MM-DD"`.
 *
 * @param day - Clé de jour à parser.
 * @returns Objet `Date` correspondant (à minuit, heure locale).
 */
export function parseDayKey(day: string): Date {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Calcule le nombre de jours entiers entre deux dates.
 *
 * Les dates sont normalisées à minuit (heure locale) afin d’éviter
 * les écarts liés aux heures, minutes ou secondes.
 *
 * @param a - Date de départ.
 * @param b - Date de fin.
 * @returns Nombre de jours entre `a` et `b` (positif, négatif ou nul).
 */
export function daysBetween(a: Date, b: Date) {
    const ms = 24 * 60 * 60 * 1000;
    const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((db - da) / ms);
}

/**
 * Calcule les streaks courant et maximal à partir d’une liste de jours.
 *
 * Règles :
 * - Les jours sont dédupliqués puis triés chronologiquement.
 * - Un streak correspond à une suite de jours consécutifs (`delta === 1`).
 * - Le meilleur streak (`best`) est la longueur maximale observée.
 * - Le streak courant (`current`) dépend de la date la plus récente :
 *   - si le dernier jour est aujourd’hui ou hier → streak actif,
 *   - sinon → streak courant à 0.
 *
 * @param dayKeys - Liste de clés de jour (non nécessairement uniques ni triées).
 * @returns Objet contenant le streak courant et le meilleur streak.
 */
export function computeStreak(dayKeys: DayKey[]): { current: number; best: number } {
    if (dayKeys.length === 0) return { current: 0, best: 0 };

    const uniq = Array.from(new Set(dayKeys)).sort(); // tri chronologique ascendant
    const dates = uniq.map(parseDayKey);

    let best = 1;
    let run = 1;

    for (let i = 1; i < dates.length; i++) {
        const delta = daysBetween(dates[i - 1], dates[i]);
        if (delta === 1) run += 1;
        else run = 1;
        best = Math.max(best, run);
    }

    /**
     * Calcul du streak courant.
     *
     * Il est basé sur le dernier jour loggé par rapport à la date du jour.
     */
    const last = dates[dates.length - 1];
    const today = new Date();
    const deltaToToday = daysBetween(
        last,
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );

    let current = run;
    if (deltaToToday > 1) current = 0;

    return { current, best };
}

/**
 * Tronque un tableau pour ne conserver que les `max` derniers éléments.
 *
 * Si la taille du tableau est inférieure ou égale à `max`,
 * le tableau original est retourné tel quel.
 *
 * @typeParam T - Type des éléments du tableau.
 * @param arr - Tableau source.
 * @param max - Taille maximale souhaitée.
 * @returns Tableau tronqué ou original.
 */
export function clampRange<T>(arr: T[], max: number) {
    if (arr.length <= max) return arr;
    return arr.slice(arr.length - max);
}

/**
 * Calcule une moyenne mobile simple (SMA) sur une série de valeurs.
 *
 * Comportement :
 * - Pour chaque index `i`, la moyenne est calculée sur les valeurs
 *   `[i - windowSize + 1, i]` (bornées à 0).
 * - Les premières valeurs utilisent une fenêtre partielle.
 *
 * @param values - Série de valeurs numériques.
 * @param windowSize - Taille de la fenêtre de lissage.
 * @returns Série lissée de même longueur que `values`.
 */
export function simpleMovingAverage(values: number[], windowSize: number) {
    if (windowSize <= 1) return values;
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) {
        const from = Math.max(0, i - windowSize + 1);
        const chunk = values.slice(from, i + 1);
        out.push(chunk.reduce((s, v) => s + v, 0) / chunk.length);
    }
    return out;
}

/**
 * Calcule la variation relative en pourcentage entre deux valeurs.
 *
 * Règles :
 * - Si `previous === 0` :
 *   - retourne `0` si `current === 0`,
 *   - retourne `100` sinon.
 * - Le résultat est arrondi à l’entier le plus proche.
 *
 * @param current - Valeur courante.
 * @param previous - Valeur précédente.
 * @returns Variation en pourcentage.
 */
export function pctDelta(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
}
