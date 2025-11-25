"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Messages } from "./get-dictionary";

/**
 * Valeur transportée par le contexte de traduction.
 * Contient la locale active ainsi que l’ensemble des messages i18n.
 */
type TranslationContextValue = {
    locale: Locale;
    messages: Messages;
};

/**
 * Contexte React chargé de diffuser la configuration de traduction
 * (locale et messages) à l’ensemble de l’arbre de composants.
 */
const TranslationContext = createContext<TranslationContextValue | null>(
    null,
);

/**
 * Fournit le contexte de traduction aux composants descendants.
 * Doit englober toute partie de l’application nécessitant l’i18n.
 *
 * @param locale - Locale active utilisée pour la traduction.
 * @param messages - Dictionnaire de messages associé à la locale.
 * @param children - Sous-arbre de composants devant accéder aux traductions.
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
 * Lit une valeur potentiellement imbriquée dans un objet
 * à partir d'un chemin du type "a.b.c".
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
 * Hook utilitaire pour accéder aux traductions depuis les composants.
 * Permet éventuellement de cibler un namespace spécifique du dictionnaire.
 *
 * @param namespace - (Optionnel) Namespace du dictionnaire à utiliser.
 * @returns Une fonction de traduction prenant une clé et retournant une chaîne.
 *          Si la clé est inconnue, la clé brute est renvoyée.
 *
 * @throws Error si le hook est utilisé en dehors de `<TranslationProvider>`.
 */
export function useTranslations(namespace?: string) {
    const ctx = useContext(TranslationContext);

    if (!ctx) {
        throw new Error(
            "useTranslations must be used inside <TranslationProvider>",
        );
    }

    const { locale, messages } = ctx;

    // On indique explicitement à TS que locale est une clé de messages
    //const localeMessages = messages[locale as keyof Messages];
    const localeMessages = messages;

    if (!localeMessages) {
        return (key: string) => key;
    }

    // On récupère soit la branche de namespace, soit tout l'objet de locale
    const namespaceValue =
        namespace != null
            ? (localeMessages as Record<string, unknown>)[namespace]
            : localeMessages;

    const dictionary =
        namespace != null &&
        namespaceValue !== null &&
        typeof namespaceValue === "object"
            ? namespaceValue
            : localeMessages;

    return (key: string): string => {
        const value = getNestedValue(dictionary, key);
        return value ?? key; // fallback : on renvoie la clé brute si introuvable
    };
}
