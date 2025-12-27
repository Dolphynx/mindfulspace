"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import AuthButtons from "@/components/auth/AuthButtons";
import NotificationsBell from "@/components/notifications/NotificationsBell"; // Import de NotificationsBell
import { apiFetch } from "@/lib/api/client";

import {
    type NavbarMode,
    type NavItem,
    ME_PATH,
    COMMON_ITEMS,
    CLIENT_ITEMS,
    PUBLIC_ITEMS,
} from "@/components/layout/mainNavbar.config";

type MainNavbarProps = {
    mode: NavbarMode;
};

export function MainNavbar({ mode }: MainNavbarProps) {
    const pathname = usePathname();

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const t = useTranslations("navbar");

    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        if (mode === "client") {
            setIsAuthenticated(true);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!baseUrl) {
                    if (!cancelled) setIsAuthenticated(false);
                    return;
                }

                const url = `${baseUrl}${ME_PATH}`;

                const res = await apiFetch(url, { cache: "no-store" });

                if (cancelled) return;

                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (e) {
                if (!cancelled) {
                    setIsAuthenticated(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [mode]);

    const effectiveMode: NavbarMode = useMemo(() => {
        if (mode === "client") return "client";
        if (isAuthenticated === true) return "client";
        return "public";
    }, [mode, isAuthenticated]);

    const items: NavItem[] = [
        ...COMMON_ITEMS,
        ...(effectiveMode === "client" ? CLIENT_ITEMS : PUBLIC_ITEMS),
    ];

    const NavButton = ({ item }: { item: NavItem }) => {
        const href = item.href(locale);
        const childHrefs = item.children?.map((c) => c.href(locale)) ?? [];

        const active = pathname.startsWith(href) || childHrefs.some((h) => pathname.startsWith(h));

        const baseClass = [
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
            "w-full justify-start",
            "lg:w-auto lg:justify-center",
            active
                ? "text-brandText border-transparent bg-transparent underline underline-offset-4"
                : "text-brandText border-transparent hover:bg-white/60 hover:border-brandBorder"
        ].join(" ");

        if (!item.children?.length) {
            return (
                <Link href={href} className={baseClass}>
                    {item.icon ? <span className="text-sm leading-none">{item.icon}</span> : null}
                    <span>{t(item.labelKey)}</span>
                </Link>
            );
        }

        const isDropdownOpen = openDropdown === item.key;

        return (
            <div className="relative w-full lg:w-auto group">
                <Link
                    href={href}
                    className={baseClass}
                    onClick={(e) => {
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
                        "hidden lg:group-hover:block",
                        isDropdownOpen ? "block lg:block" : "hidden lg:hidden",
                        "w-full rounded-xl border border-brandBorder bg-white/90 shadow-lg backdrop-blur",
                        "lg:absolute lg:left-0 lg:top-full lg:min-w-56",
                        "lg:mt-px",
                        "z-50",
                    ].join(" ")}
                    role="menu"
                    aria-label={t(item.labelKey)}
                >
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
     * Dans cette version le logo redirige toujours vers la home page.
     * La version commentée prévoyait : home page quand non connecté / world quand connecté
     */
    //const homeHref = effectiveMode === "client" ? `/${locale}/member/world-v2` : `/${locale}`;
    const homeHref = `/${locale}`;

    return (
        <header className="w-full bg-brandSurface border-b border-brandBorder">
            <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center justify-between">
                        <Link href={homeHref} className="flex items-center gap-2">
                            <Image
                                src="/images/MindfulSpace_logo.png"
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

                        {/* Notifications Bell aligné à droite */}
                        {isAuthenticated && (
                            <div className="ml-auto">
                                <NotificationsBell />
                            </div>
                        )}

                        {/* AuthButtons */}
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
