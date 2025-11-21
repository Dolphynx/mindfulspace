import type { Locale } from "./config";
import fr from "./dictionaries/fr";
import en from "./dictionaries/en";

/**
 * Type représentant la structure complète des messages de localisation.
 * Il est dérivé du dictionnaire français, utilisé ici comme référence.
 */
export type Messages = typeof fr;

// Dictionnaires strictement typés
const dictionaries: Record<Locale, Messages> = {
    fr,
    en,
};

/**
 * Récupère le dictionnaire de traduction associé à la locale fournie.
 * Si la locale n’est pas reconnue, le dictionnaire par défaut (`fr`) est retourné.
 *
 * @param locale - Locale demandée.
 * @returns Le dictionnaire strictement typé correspondant.
 */
export async function getDictionary(locale: Locale): Promise<Messages> {
    return dictionaries[locale] ?? dictionaries.fr;
}
