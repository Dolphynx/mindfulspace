import type { Locale } from "./config";
import { defaultLocale } from "./config";
import fr from "./dictionaries/fr";

/**
 * Type représentant la structure complète des messages de traduction.
 *
 * @remarks
 * La structure est dérivée du dictionnaire français, utilisé comme
 * référence de typage pour l’ensemble des langues.
 * Toutes les autres langues doivent respecter exactement la même
 * structure afin de garantir la cohérence des clés.
 */
export type Messages = typeof fr;

/**
 * Charge dynamiquement le dictionnaire de traduction correspondant
 * à la locale fournie.
 *
 * @remarks
 * - Le chargement est effectué côté serveur via un import dynamique.
 * - Aucun mapping manuel des langues n’est nécessaire.
 * - En cas de locale inconnue ou de fichier manquant, un fallback
 *   vers la langue par défaut est automatiquement appliqué.
 *
 * Ce mécanisme permet d’ajouter de nouvelles langues en se limitant
 * à :
 * - l’ajout de la locale dans `config.ts`,
 * - la création du fichier `dictionaries/<locale>.ts`.
 *
 * Le cœur du système i18n ne nécessite alors aucune modification.
 *
 * @param locale - Locale demandée (issue du segment de route `[locale]`).
 * @returns Le dictionnaire de traduction strictement typé.
 */
export async function getDictionary(locale: Locale): Promise<Messages> {
    try {
        const dictionary = await import(`./dictionaries/${locale}`);
        return dictionary.default as Messages;
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                `[i18n] Dictionnaire introuvable pour la locale "${locale}", fallback vers "${defaultLocale}".`
            );
        }

        const fallback = await import(`./dictionaries/${defaultLocale}`);
        return fallback.default as Messages;
    }
}
