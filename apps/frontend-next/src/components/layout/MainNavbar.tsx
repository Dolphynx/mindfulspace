"use client";

/**
 * MainNavbar
 * ----------
 * Navbar unique utilisée à la fois pour :
 *  - le module public      → mode = "public"
 *  - le module client      → mode = "client"
 *
 * Idée :
 *  - items communs : ressources, becomecoach, contact
 *  - items côté client : respiration, dashboard, objectifs
 *  - item côté public : lien "Espace client"
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

type NavItem = {
    key: string;
    href: (locale: Locale) => string;
    labelKey: string;
};

type MainNavbarProps = {
    mode: NavbarMode;
};

export function MainNavbar({ mode }: MainNavbarProps) {
    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("navbar");
    const [isOpen, setIsOpen] = useState(false);

    // Items communs (public + client)
    const commonItems: NavItem[] = [
        {
            key: "resources",
            href: (loc) => `/${loc}/resources`,
            labelKey: "resources",
        },
        {
            key: "becomecoach",
            href: (loc) => `/${loc}/becomecoach`,
            labelKey: "becomecoach",
        },
        {
            key: "contact",
            href: (loc) => `/${loc}/contact`,
            labelKey: "contact",
        },
    ];

    // Items spécifiques au client (espace connecté)
    const clientItems: NavItem[] = [
        {
            key: "breathing",
            href: (loc) => `/${loc}/member/seance/respiration`,
            labelKey: "breathing",
        },
        {
            key: "world",
            href: (loc) => `/${loc}/member/world`,
            labelKey: "world",
        },
    ];

    // Item spécifique au public : entrée vers l’espace member
    const publicItems: NavItem[] = [
        {
            key: "clientSpace",
            href: (loc) => `/${loc}/member/world`,
            labelKey: "clientSpace",
        },
    ];

    const items: NavItem[] = [
        ...commonItems,
        ...(mode === "client" ? clientItems : publicItems),
    ];

    const NavButton = ({ item }: { item: NavItem }) => {
        const href = item.href(locale);
        const active = pathname.startsWith(href);

        return (
            <Link
                href={href}
                className={[
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
                    "w-full justify-start",
                    "lg:w-auto lg:justify-center",
                    active
                        ? "bg-brandGreen text-white border-brandGreen shadow-sm"
                        : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder",
                ].join(" ")}
            >
                <span>{t(item.labelKey)}</span>
            </Link>
        );
    };
    
    // Lien du logo : page d’accueil publique ou world client
    const homeHref =
        mode === "client"
            ? `/${locale}/member/world`
            : `/${locale}`;

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
                    <div className={[
                        isOpen ? "flex" : "hidden",
                        "lg:hidden mt-2"
                    ].join(" ")}>
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </header>
    );
}
