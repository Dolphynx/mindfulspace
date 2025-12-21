/**
 * @file mainNavbar.config.ts
 * @description
 * Configuration “pure” de la MainNavbar (items + constantes).
 *
 * @remarks
 * Aucun import React, aucun side-effect, aucun "use client".
 */

import type { Locale } from "@/i18n/config";

export type NavbarMode = "public" | "client";

/**
 * Item du sous-menu (dropdown).
 */
export type NavChildItem = {
    /** Clé unique React. */
    key: string;
    /** Génère l'URL en fonction de la locale. */
    href: (locale: Locale) => string;
    /** Clé i18n dans le namespace `navbar.*`. */
    labelKey: string;
};

/**
 * Item principal de la navbar.
 *
 * @remarks
 * - Un item peut contenir des `children` pour devenir un dropdown.
 * - Dans ce cas, `href` reste présent : le parent est cliquable (desktop) et sert de "racine".
 */
export type NavItem = {
    /** Clé unique React. */
    key: string;
    /** Génère l'URL en fonction de la locale. */
    href: (locale: Locale) => string;
    /** Clé i18n dans le namespace `navbar.*`. */
    labelKey: string;
    /** Petite icône texte (optionnel). */
    icon?: string;
    /** Sous-items (optionnel) → transforme l'item en dropdown. */
    children?: NavChildItem[];
};

/**
 * Endpoint minimal "me" pour vérifier si la session/cookies sont valides.
 *
 * @remarks
 * Adapter si ton backend expose un autre endpoint (ex: `/users/me`).
 */
export const ME_PATH = "/auth/me";

/**
 * Items communs (public + client).
 */
export const COMMON_ITEMS: NavItem[] = [
    { key: "resources", href: (loc) => `/${loc}/resources`, labelKey: "resources" },
    { key: "becomecoach", href: (loc) => `/${loc}/becomecoach`, labelKey: "becomecoach" },
    { key: "contact", href: (loc) => `/${loc}/contact`, labelKey: "contact" },
];

/**
 * Items spécifiques au client (espace connecté).
 */
export const CLIENT_ITEMS: NavItem[] = [
    {
        key: "breathing",
        href: (loc) => `/${loc}/member/seance/respiration`,
        labelKey: "breathing",
        icon: "▶️",
    },
    {
        key: "world",
        href: (loc) => `/${loc}/member/world-v2`,
        labelKey: "world",
    },
    /* World item before SPA
      {
        key: "world",
        href: (loc) => `/${loc}/member/world`,
        labelKey: "world",
        children: [
            { key: "world", href: (loc) => `/${loc}/member/world`, labelKey: "world2" },
            { key: "meditation", href: (loc) => `/${loc}/member/domains/meditation`, labelKey: "meditation" },
            { key: "exercise", href: (loc) => `/${loc}/member/domains/exercise`, labelKey: "exercise" },
            { key: "sleep", href: (loc) => `/${loc}/member/domains/sleep`, labelKey: "sleep" },
            { key: "badges", href: (loc) => `/${loc}/member/badges`, labelKey: "badges" },
        ],
    },*/
];

/**
 * Item spécifique au public : entrée vers l’espace member.
 */
export const PUBLIC_ITEMS: NavItem[] = [
    { key: "clientSpace", href: (loc) => `/${loc}/member/world-v2`, labelKey: "clientSpace" },
];
