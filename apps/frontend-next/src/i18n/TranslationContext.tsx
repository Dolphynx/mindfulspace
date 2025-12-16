"use client";

import React, { createContext, useCallback, useContext } from "react";
import type { Locale } from "./config";
import type { Messages } from "./get-dictionary";

/**
 * Valeur exposée par le contexte de traduction.
 *
 * @remarks
 * Le contexte fournit :
 * - la locale active (déduite du segment de route `[locale]`),
 * - le dictionnaire de traduction correspondant,
 * - un point d’accès centralisé aux données i18n côté client.
 *
 * Le chargement des traductions reste exclusivement côté serveur
 * (`getDictionary`), le client ne fait que consommer ces données.
 */
type TranslationContextValue = {
    /** Locale active de l’application. */
    locale: Locale;

    /** Dictionnaire de traduction correspondant à la locale active. */
    dictionary: Messages;
};

/**
 * Contexte React interne pour l’i18n.
 *
 * @remarks
 * Initialisé à `null` afin de pouvoir détecter toute utilisation
 * hors d’un `TranslationProvider` et lever une erreur explicite.
 */
const TranslationContext = createContext<TranslationContextValue | null>(null);

/**
 * Récupère une valeur imbriquée dans un objet à partir d’un chemin
 * exprimé en notation pointée (ex: `"navbar.home"`).
 *
 * @remarks
 * Cette fonction est volontairement défensive :
 * - vérifie la nature des objets traversés,
 * - évite toute exception en cas de clé manquante,
 * - retourne `undefined` si le chemin n’existe pas.
 *
 * @param obj - Objet source (dictionnaire complet ou sous-objet).
 * @param path - Chemin de clé imbriquée séparé par des points.
 * @returns La valeur trouvée ou `undefined` si le chemin est invalide.
 */
function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object") return undefined;

    return path.split(".").reduce<unknown>((acc, key) => {
        if (!acc || typeof acc !== "object") return undefined;
        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/**
 * Provider i18n principal de l’application.
 *
 * @remarks
 * Ce provider doit être utilisé dans `app/[locale]/layout.tsx`.
 * Il rend accessibles :
 * - la locale active,
 * - le dictionnaire de traduction,
 * à l’ensemble des composants client descendants.
 *
 * Le provider ne contient aucune logique de chargement : il se
 * contente de propager les données calculées côté serveur.
 *
 * @param props - Propriétés du provider.
 * @param props.locale - Locale active de l’application.
 * @param props.dictionary - Dictionnaire correspondant à la locale.
 * @param props.children - Arbre de composants descendants.
 * @returns Provider React encapsulant `children`.
 */
export function TranslationProvider({
                                        locale,
                                        dictionary,
                                        children,
                                    }: {
    locale: Locale;
    dictionary: Messages;
    children: React.ReactNode;
}) {
    return (
        <TranslationContext.Provider value={{ locale, dictionary }}>
            {children}
        </TranslationContext.Provider>
    );
}

/**
 * Accès interne au contexte de traduction.
 *
 * @remarks
 * Cette fonction centralise la vérification de la présence du
 * `TranslationProvider` afin d’éviter la duplication de code
 * dans les hooks publics.
 *
 * @returns Valeur du contexte i18n.
 * @throws Error Si utilisé en dehors d’un `TranslationProvider`.
 */
function useTranslationContext(): TranslationContextValue {
    const ctx = useContext(TranslationContext);
    if (!ctx) {
        throw new Error(
            "useTranslations/useLocale must be used within a TranslationProvider."
        );
    }
    return ctx;
}

/**
 * Retourne la locale actuellement active.
 *
 * @remarks
 * Permet d’éviter de re-parser l’URL (`usePathname`) dans les composants
 * client. La locale est fournie directement par le contexte i18n.
 *
 * @returns La locale active.
 */
export function useLocale(): Locale {
    return useTranslationContext().locale;
}

/**
 * Hook principal de traduction côté client.
 *
 * @remarks
 * - `useTranslations("namespace")` renvoie une fonction `t(key)`.
 * - `key` peut être :
 *   - simple : `"title"`,
 *   - imbriquée : `"hero.title"`.
 *
 * En cas de clé manquante :
 * - en environnement de développement, un warning est affiché
 *   afin de faciliter la détection des erreurs ;
 * - en production, la clé est renvoyée telle quelle pour éviter
 *   toute interruption du rendu.
 *
 * La fonction retournée est mémoïsée (`useCallback`) afin de
 * garantir une référence stable entre les renders.
 *
 * @param namespace - Namespace racine des traductions (ex: `"navbar"`).
 * @returns Fonction de traduction `t(key)`.
 */
export function useTranslations(namespace?: string) {
    const { dictionary, locale } = useTranslationContext();

    return useCallback(
        /**
         * Traduit une clé relative au namespace fourni.
         *
         * @param key - Clé de traduction (simple ou imbriquée).
         * @returns Texte traduit, ou la clé en fallback si introuvable.
         */
        (key: string): string => {
            const fullPath = namespace ? `${namespace}.${key}` : key;

            const value = getNestedValue(dictionary, fullPath);
            if (typeof value === "string") return value;

            if (process.env.NODE_ENV === "development") {
                // eslint-disable-next-line no-console
                console.warn(
                    `[i18n] Missing translation: "${fullPath}" (locale="${locale}")`
                );
            }

            return key;
        },
        [dictionary, locale, namespace]
    );
}
