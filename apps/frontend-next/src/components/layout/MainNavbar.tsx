"use client";

/**
 * MainNavbar
 * ----------
 * Navbar unique utilisée à la fois pour :
 *  - le module public → mode = "public"
 *  - le module client → mode = "client"
 *
 * Principes UI/UX :
 *  - Items communs : resources, becomecoach, contact
 *  - Items client : breathing + "world" (dropdown)
 *  - Dropdown "world" :
 *      - Desktop (≥ lg) : ouverture au survol (CSS `group-hover`)
 *      - Mobile (< lg)  : ouverture au clic (state React) + `preventDefault` pour éviter la navigation immédiate
 *
 * Accessibilité :
 *  - Le parent "world" reste un lien (desktop) et un toggle (mobile).
 *  - Les items du sous-menu sont des liens standards.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthButtons from "@/components/auth/AuthButtons";

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
 * - Dans ce cas, `href` reste présent : le parent est cliquable (desktop) et sert de "racine" (world).
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
    /** Mode d’affichage (public vs client). */
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
            href: (loc) => `/${loc}/member/world`,
            labelKey: "world",
            children: [
                { key: "badges", href: (loc) => `/${loc}/member/badges`, labelKey: "badges" },
                { key: "meditation", href: (loc) => `/${loc}/member/domains/meditation`, labelKey: "meditation" },
                { key: "exercise", href: (loc) => `/${loc}/member/domains/exercise`, labelKey: "exercise" },
                { key: "sleep", href: (loc) => `/${loc}/member/domains/sleep`, labelKey: "sleep" },
            ],
        },
    ];

    /**
     * Item spécifique au public : entrée vers l’espace member.
     */
    const publicItems: NavItem[] = [
        { key: "clientSpace", href: (loc) => `/${loc}/member/world`, labelKey: "clientSpace" },
    ];

    const items: NavItem[] = [
        ...commonItems,
        ...(mode === "client" ? clientItems : publicItems),
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
         * - Desktop : affichage via `lg:group-hover:block` pour éviter l’effet "je quitte le bouton → menu disparaît"
         * - Mobile : affichage via state `openDropdown`
         */
        const isDropdownOpen = openDropdown === item.key;

        return (
            <div className="relative w-full lg:w-auto group">
                <Link
                    href={href}
                    className={baseClass}
                    onClick={(e) => {
                        /**
                         * Mobile : le clic sert à ouvrir/fermer le menu.
                         * On empêche la navigation immédiate, sinon on ne voit jamais le dropdown.
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

                <div
                    className={[
                        // Desktop : hover sur le "group" (bouton OU panneau) → le menu reste ouvert.
                        "hidden lg:group-hover:block",
                        // Mobile : état React (toggle au clic).
                        isDropdownOpen ? "block lg:block" : "hidden lg:hidden",

                        "mt-2 w-full rounded-xl border border-brandBorder bg-white/90 shadow-lg backdrop-blur",
                        "lg:absolute lg:left-0 lg:mt-2 lg:min-w-56",
                        "z-50",
                    ].join(" ")}
                    role="menu"
                    aria-label={t(item.labelKey)}
                >
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
     */
    const homeHref = mode === "client" ? `/${locale}/member/world` : `/${locale}`;

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
