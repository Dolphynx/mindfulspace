/**
 * MoodValue
 *
 * Représente la valeur brute d’une humeur.
 * - Valeurs discrètes de 1 à 5.
 * - Utilisé partout : base de données, sélection UI, calculs.
 */
export type MoodValue = 1 | 2 | 3 | 4 | 5;

/**
 * MoodOption
 *
 * Représente une option d’humeur affichable :
 * - value : identifiant stable (persisté dans la DB, utilisé par l’UI, etc.)
 * - emoji : rendu visuel principal
 * - label : libellé lisible et adapté à la localisation (i18n-friendly)
 */
export type MoodOption = {
    value: MoodValue;      // clé stable (persistée en DB)
    emoji: string;         // rendu visuel (emoji)
    label: string;         // libellé lisible / i18n-ready
};

/**
 * Liste complète des options d’humeur disponibles dans l’application.
 *
 * - Ordonnée du plus négatif → plus positif.
 * - Chaque option est un MoodOption complet.
 * - Utilisée par :
 *   - MoodPicker
 *   - composants graphiques
 *   - transformation en pourcentage
 *   - affichage des entrées DB
 */
export const MOOD_OPTIONS: MoodOption[] = [
    { value: 1, emoji: "🥲", label: "Difficile" },
    { value: 2, emoji: "🙁", label: "Pas top" },
    { value: 3, emoji: "😐", label: "Correct" },
    { value: 4, emoji: "🙂", label: "Bien" },
    { value: 5, emoji: "😊", label: "Excellent" },
];

/**
 * moodToPercent
 *
 * Convertit une humeur brute (1–5) en pourcentage (20–100).
 *
 * Utile pour :
 * - graphiques
 * - notation visuelle
 * - calcul d'indicateurs
 *
 * Exemple :
 *   moodToPercent(3) → 60
 */
export const moodToPercent = (v: MoodValue) => v * 20;

/**
 * getMood
 *
 * Retourne l’option MoodOption correspondant à une valeur numérique.
 *
 * - Si la valeur passée est invalide / hors range :
 *   → renvoie l’option centrale (« Correct ») par défaut.
 *
 * Utile en cas de récupération de données venant :
 * - du backend,
 * - de l’utilisateur,
 * - d’une source externe non contrôlée.
 */
export const getMood = (v: number) =>
    MOOD_OPTIONS.find(o => o.value === (v as MoodValue)) ?? MOOD_OPTIONS[2];
