/**
 * Liste des locales supportées par l'application.
 * Elle est définie en tant que tuple immuable afin de garantir
 * une cohérence stricte lors de l'utilisation et du typage.
 */
export const locales = ["fr", "en"] as const;

/**
 * Type utilitaire représentant l’ensemble des locales disponibles.
 * Permet d'assurer un typage sécurisé dans toute l’application.
 */
export type Locale = (typeof locales)[number];

/**
 * Locale utilisée par défaut lorsqu’aucune langue n’est spécifiée
 * ou lorsque la détection automatique échoue.
 */
export const defaultLocale: Locale = "fr";

/**
 * Vérifie si une valeur fournie correspond à une locale valide.
 *
 * @param value - Chaîne à contrôler.
 * @returns `true` si la valeur correspond à une locale supportée, sinon `false`.
 */
export function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}
