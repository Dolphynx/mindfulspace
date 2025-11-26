"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Messages } from "./get-dictionary";

/**
 * Structure portée par le contexte de traduction.
 *
 * Fournit :
 * - la locale active
 * - l’ensemble des messages i18n chargés pour cette locale
 *
 * Cette valeur est distribuée dans l’arbre React via `TranslationContext`.
 */
type TranslationContextValue = {
    /** Code de langue actif (ex.: "fr", "en"). */
    locale: Locale;

    /** Dictionnaire des messages associés à cette locale. */
    messages: Messages;
};

/**
 * Contexte React contenant la configuration i18n (locale + messages).
 *
 * Par défaut, la valeur est `null` afin de pouvoir lever une erreur
 * claire si un composant consomme la traduction hors provider.
 */
const TranslationContext = createContext<TranslationContextValue | null>(
    null,
);

/**
 * Composant provider enveloppant une portion de l’arbre
 * pour injecter :
 * - la locale active
 * - le dictionnaire de messages
 *
 * Ce provider doit englober toute section de l'application
 * nécessitant l’usage du hook `useTranslations`.
 *
 * @param props.locale Locale active.
 * @param props.messages Ensemble des messages i18n pour cette locale.
 * @param props.children Sous-arbre devant accéder aux traductions.
 */
export function TranslationProvider({
                                        locale,
                                        messages,
                                        children,
                                    }: {
    locale: Locale;
    messages: Messages;
    children: React.ReactNode;
}) {
    return (
        <TranslationContext.Provider value={{ locale, messages }}>
            {children}
        </TranslationContext.Provider>
    );
}

/**
 * Recherche une valeur dans un objet imbriqué à partir d’un chemin
 * de type `"a.b.c"`.
 *
 * Ce mécanisme permet d’adresser proprement des clés i18n
 * structurées en profondeur.
 *
 * @param obj Objet racine dans lequel naviguer.
 * @param path Chemin sous forme de segments séparés par des points.
 * @returns La valeur trouvée si elle est une chaîne, sinon `undefined`.
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
    const segments = path.split(".");

    let current: unknown = obj;

    for (const segment of segments) {
        if (
            current !== null &&
            typeof current === "object" &&
            Object.prototype.hasOwnProperty.call(current, segment)
        ) {
            current = (current as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }

    return typeof current === "string" ? current : undefined;
}

/**
 * Hook permettant d’obtenir une fonction de traduction.
 *
 * Fonctionnement :
 * - Lit le contexte (locale + messages)
 * - Permet éventuellement de cibler un namespace
 * - Retourne une fonction `t(key)` qui cherche la clé dans le dictionnaire
 *
 * Si la clé n’est pas trouvée, la valeur retournée est la clé brute,
 * ce qui permet une tolérance lors du développement.
 *
 * @param namespace Namespace optionnel du dictionnaire à cibler
 *                  (ex.: `"domainMeditation"`, `"errors"`, etc.).
 * @throws Erreur si utilisé hors `<TranslationProvider>`.
 * @returns Fonction de traduction.
 */
export function useTranslations(namespace?: string) {
    const ctx = useContext(TranslationContext);

    if (!ctx) {
        throw new Error(
            "useTranslations must be used inside <TranslationProvider>",
        );
    }

    const { locale, messages } = ctx;

    // Dans cette implémentation, les `messages` sont déjà filtrés par locale
    const localeMessages = messages;

    if (!localeMessages) {
        return (key: string) => key;
    }

    // Sélection du namespace si fourni
    const namespaceValue =
        namespace != null
            ? (localeMessages as Record<string, unknown>)[namespace]
            : localeMessages;

    // Si le namespace n'est pas un objet valide, on retombe sur l’objet complet
    const dictionary =
        namespace != null &&
        namespaceValue !== null &&
        typeof namespaceValue === "object"
            ? namespaceValue
            : localeMessages;

    /**
     * Fonction retournée permettant de résoudre une clé de traduction.
     * @param key Clé textuelle (ex.: `"wizard_stepType_title"`).
     */
    return (key: string): string => {
        const value = getNestedValue(dictionary, key);
        return value ?? key;
    };
}
