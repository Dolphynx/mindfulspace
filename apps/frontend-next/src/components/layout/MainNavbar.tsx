"use client";

/**
 * MainNavbar
 * ----------
 * Navbar unique utilisée à la fois pour :
 *  - le module public → mode = "public"
 *  - le module client → mode = "client"
 *
 * Problème UX (cohérence navigation) :
 *  - Lorsque l’utilisateur est connecté mais navigue sur une page publique (ex: /contact),
 *    le layout public affiche la navbar en `mode="public"`, ce qui remplace les items client
 *    ("Respiration", "Mon monde") par l’item public "Espace client".
 *  - Résultat : incohérence perçue ("je suis connecté, pourquoi je n’ai plus mon menu ?").
 *
 * Solution :
 *  - Introduire une notion de "mode effectif" : si l’utilisateur est authentifié,
 *    la navbar affiche les items client même si la page courante est publique.
 *  - La détection d’auth se fait côté client via un appel `GET /auth/me` (configurable),
 *    en utilisant `apiFetch` (compatible cookies httpOnly / credentials).
 *
 * Problème UX résolu (dropdown desktop) :
 *  - Le dropdown desktop disparaissait lorsqu’il existait un “gap” vertical entre
 *    le bouton parent et le panneau (le curseur passe sur une zone qui n’appartient
 *    ni au bouton ni au menu → le hover se perd).
 *
 * Solution dropdown :
 *  - Coller le panneau au bouton (`top-full`) et éviter un `mt-*` “dangereux” sur desktop.
 *  - Ajouter une zone tampon invisible au-dessus du panneau pour sécuriser le passage souris.
 *
 * Comportement :
 *  - Desktop (≥ lg) : ouverture au survol (`group-hover`) + hover stable
 *  - Mobile (< lg)  : ouverture au clic (state React) + `preventDefault`
 *
 * Accessibilité :
 *  - Le parent "world" reste un lien (desktop) et un toggle (mobile).
 *  - Le sous-menu utilise `role="menu"` / `role="menuitem"` et un label ARIA.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import AuthButtons from "@/components/auth/AuthButtons";
import { apiFetch } from "@/lib/api/client";

type NavbarMode = "public" | "client";

/**
 * Item du sous-menu (dropdown).
 */
type NavChildItem = {
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
type NavItem = {
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

type MainNavbarProps = {
    /** Mode d’affichage (public vs client), généralement déterminé par le layout courant. */
    mode: NavbarMode;
};

export function MainNavbar({ mode }: MainNavbarProps) {
    const pathname = usePathname();

    // Détection de locale depuis l’URL (premier segment).
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("navbar");

    // Menu burger mobile.
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Dropdown mobile : stocke la key de l’item ouvert.
     *
     * @remarks
     * Sur desktop, on ouvre au survol via CSS `group-hover` (pas besoin de state).
     * Sur mobile, on ouvre au clic via ce state.
     */
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    /**
     * État d’authentification côté navbar.
     *
     * @remarks
     * - `null` = inconnu (au premier render)
     * - `true` = authentifié
     * - `false` = non authentifié
     *
     * On s’en sert pour définir un "mode effectif" :
     * - si la page est publique mais l’utilisateur est connecté → afficher le menu client.
     */
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    /**
     * Endpoint minimal "me" pour vérifier si la session/cookies sont valides.
     *
     * @remarks
     * Adapter si ton backend expose un autre endpoint (ex: `/users/me`).
     */
    const ME_PATH = "/auth/me";

    useEffect(() => {
        /**
         * Optimisation :
         * - Si on est déjà en mode client, le menu client s’affiche quoi qu’il arrive,
         *   et l’état auth est déjà “implicite” côté UI.
         * - Néanmoins, garder la vérification peut être utile si ton UI doit refléter
         *   une déconnexion silencieuse ; ici on fait simple : on ne force pas en mode client.
         */
        if (mode === "client") {
            setIsAuthenticated(true);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!baseUrl) {
                    // En absence de base URL, on ne peut pas valider l’auth de manière fiable.
                    if (!cancelled) setIsAuthenticated(false);
                    return;
                }

                const url = `${baseUrl}${ME_PATH}`;

                /**
                 * `apiFetch` doit inclure les credentials/cookies (httpOnly) afin que le backend
                 * puisse déterminer la session réelle de l’utilisateur.
                 *
                 * Objectif :
                 * - 200 → connecté
                 * - 401/403 → non connecté
                 * - autre → considérer non connecté (et loguer pour debug)
                 */
                const res = await apiFetch(url, { cache: "no-store" });

                if (cancelled) return;

                if (res.ok) {
                    setIsAuthenticated(true);
                } else if (res.status === 401 || res.status === 403) {
                    setIsAuthenticated(false);
                } else {
                    console.error("[MainNavbar] Unexpected auth check status:", res.status);
                    setIsAuthenticated(false);
                }
            } catch (e) {
                if (!cancelled) {
                    console.error("[MainNavbar] Auth check failed:", e);
                    setIsAuthenticated(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [mode, ME_PATH]);

    /**
     * Mode effectif de rendu des items.
     *
     * @remarks
     * Règle métier demandée :
     * - Si l’utilisateur est authentifié → afficher les items client,
     *   même si on est sur une page publique.
     * - Sinon, respecter le `mode` passé par le layout.
     *
     * Note :
     * - Tant que l’auth est inconnue (`null`), on respecte le mode du layout
     *   pour éviter des “flash” de menu (peut être ajusté si tu préfères l’inverse).
     */
    const effectiveMode: NavbarMode = useMemo(() => {
        if (mode === "client") return "client";
        if (isAuthenticated === true) return "client";
        return "public";
    }, [mode, isAuthenticated]);

    /**
     * Items communs (public + client).
     */
    const commonItems: NavItem[] = [
        { key: "resources", href: (loc) => `/${loc}/resources`, labelKey: "resources" },
        { key: "becomecoach", href: (loc) => `/${loc}/becomecoach`, labelKey: "becomecoach" },
        { key: "contact", href: (loc) => `/${loc}/contact`, labelKey: "contact" },
    ];

    /**
     * Items spécifiques au client (espace connecté).
     */
    const clientItems: NavItem[] = [
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
        /*{
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
    const publicItems: NavItem[] = [
        { key: "clientSpace", href: (loc) => `/${loc}/member/world`, labelKey: "clientSpace" },
    ];

    /**
     * Liste finale des items selon le mode effectif.
     *
     * @remarks
     * `effectiveMode` peut être "client" même sur une page publique si l’utilisateur est connecté.
     */
    const items: NavItem[] = [
        ...commonItems,
        ...(effectiveMode === "client" ? clientItems : publicItems),
    ];

    /**
     * Rendu d’un item de navbar :
     * - lien simple (sans children)
     * - dropdown (avec children)
     */
    const NavButton = ({ item }: { item: NavItem }) => {
        const href = item.href(locale);
        const childHrefs = item.children?.map((c) => c.href(locale)) ?? [];

        /**
         * Active si :
         * - la route courante commence par le href parent
         * - OU par l’un des href enfants
         */
        const active =
            pathname.startsWith(href) || childHrefs.some((h) => pathname.startsWith(h));

        const baseClass = [
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
            "w-full justify-start",
            "lg:w-auto lg:justify-center",
            active
                ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder",
        ].join(" ");

        // Lien standard (sans dropdown).
        if (!item.children?.length) {
            return (
                <Link href={href} className={baseClass}>
                    {item.icon ? <span className="text-sm leading-none">{item.icon}</span> : null}
                    <span>{t(item.labelKey)}</span>
                </Link>
            );
        }

        /**
         * Dropdown :
         * - Desktop : affichage via `lg:group-hover:block` (hover stable).
         * - Mobile  : affichage via state `openDropdown`.
         */
        const isDropdownOpen = openDropdown === item.key;

        return (
            <div className="relative w-full lg:w-auto group">
                <Link
                    href={href}
                    className={baseClass}
                    onClick={(e) => {
                        /**
                         * Mobile :
                         * - Le clic sert à ouvrir/fermer le menu.
                         * - On empêche la navigation immédiate, sinon on ne voit jamais le dropdown.
                         */
                        if (window.innerWidth < 1024) {
                            e.preventDefault();
                            setOpenDropdown(isDropdownOpen ? null : item.key);
                        }
                    }}
                >
                    {item.icon ? <span className="text-sm leading-none">{item.icon}</span> : null}
                    <span>{t(item.labelKey)}</span>
                    <span className="ml-auto lg:ml-0 text-xs opacity-70">▾</span>
                </Link>

                {/* Dropdown panel */}
                <div
                    className={[
                        // Desktop : hover stable via "group-hover".
                        "hidden lg:group-hover:block",

                        // Mobile : toggle via state.
                        isDropdownOpen ? "block lg:block" : "hidden lg:hidden",

                        "w-full rounded-xl border border-brandBorder bg-white/90 shadow-lg backdrop-blur",
                        "lg:absolute lg:left-0 lg:top-full lg:min-w-56",
                        // Micro-marge visuelle sans “trou” significatif.
                        "lg:mt-px",
                        "z-50",
                    ].join(" ")}
                    role="menu"
                    aria-label={t(item.labelKey)}
                >
                    {/* Zone tampon (desktop) pour éviter les pertes de hover sur quelques pixels. */}
                    <div className="hidden lg:block absolute -top-2 left-0 right-0 h-2" />

                    <div className="p-2 flex flex-col gap-1">
                        {item.children.map((child) => {
                            const chref = child.href(locale);
                            const cactive = pathname.startsWith(chref);

                            return (
                                <Link
                                    key={child.key}
                                    href={chref}
                                    role="menuitem"
                                    className={[
                                        "rounded-lg px-3 py-2 text-sm border transition-colors",
                                        cactive
                                            ? "bg-brandGreen text-white border-brandGreen"
                                            : "border-transparent hover:bg-brandSurface hover:border-brandBorder text-brandText",
                                    ].join(" ")}
                                    onClick={() => {
                                        // Mobile : ferme le dropdown après navigation.
                                        setOpenDropdown(null);
                                    }}
                                >
                                    {t(child.labelKey)}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Lien du logo : page d’accueil publique ou world client.
     *
     * @remarks
     * On se base sur le mode effectif : si connecté, le logo mène naturellement vers le “world”.
     */
    const homeHref =
        effectiveMode === "client" ? `/${locale}/member/world` : `/${locale}`;

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center justify-between">
                        <Link href={homeHref} className="flex items-center gap-2">
                            <Image
                                src="/images/MindfulSpace_logo.jpg"
                                alt="MindfulSpace logo"
                                width={90}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </Link>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-brandBorder px-2 py-1 text-sm text-brandText hover:bg-white/70 lg:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-label={t("mobileToggle")}
                        >
                            <span className="sr-only">{t("mobileToggle")}</span>
                            <span className="flex flex-col gap-1">
                                <span className="block h-0.5 w-5 bg-brandText" />
                                <span className="block h-0.5 w-5 bg-brandText" />
                                <span className="block h-0.5 w-5 bg-brandText" />
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav
                            className={[
                                "mt-1 flex flex-col gap-2",
                                isOpen ? "flex" : "hidden",
                                "lg:mt-0 lg:flex lg:flex-row lg:items-center lg:gap-4 lg:justify-end",
                            ].join(" ")}
                        >
                            {items.map((item) => (
                                <NavButton key={item.key} item={item} />
                            ))}
                            <LanguageSwitcher />
                        </nav>

                        <div className="hidden lg:block">
                            <AuthButtons />
                        </div>
                    </div>

                    {/* Mobile auth buttons */}
                    <div className={[isOpen ? "flex" : "hidden", "lg:hidden mt-2"].join(" ")}>
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </header>
    );
}
