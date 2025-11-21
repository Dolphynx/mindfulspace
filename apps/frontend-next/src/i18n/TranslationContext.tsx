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
const TranslationContext = createContext<TranslationContextValue | null>(null);

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

// On garde la possibilité de passer un namespace, mais on tape le retour simplement.
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
export function useTranslations(namespace?: keyof Messages) {
    const ctx = useContext(TranslationContext);

    if (!ctx) {
        throw new Error("useTranslations must be used inside <TranslationProvider>");
    }

    const { messages } = ctx;

    const dict = namespace ? messages[namespace] : messages;

    return (key: string): string => {
        if (typeof dict !== "object" || dict === null) {
            return key;
        }

        const value = (dict as Record<string, unknown>)[key];

        return typeof value === "string" ? value : key;
    };
}
