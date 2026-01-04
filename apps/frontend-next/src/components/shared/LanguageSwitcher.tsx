"use client";

/**
 * @file LanguageSwitcher.tsx
 * @description
 * Sélecteur de langue compact (ex: "FR ▾") basé sur l’URL.
 *
 * @remarks
 * - Conserve le reste du chemin lors du changement de langue.
 * - Persiste la préférence utilisateur dans un cookie essentiel `locale`.
 * - Dropdown au clic (desktop + mobile).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { locales, isLocale, defaultLocale, type Locale } from "@/i18n/config";

const LOCALE_COOKIE = "locale";

function setLocaleCookie(locale: Locale) {
    const oneYear = 60 * 60 * 24 * 365;

    document.cookie =
        `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax` +
        (process.env.NODE_ENV === "production" ? "; Secure" : "");
}

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("langSwitcher");

    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const currentLocale: Locale = isLocale(raw) ? raw : defaultLocale;

    const segments = useMemo(() => pathname.split("/"), [pathname]);
    const availableLocales: readonly Locale[] = locales;

    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    function handleSwitch(nextLocale: Locale) {
        if (nextLocale === currentLocale) return;

        setLocaleCookie(nextLocale);

        const seg1 = segments[1];
        const hasLocalePrefix = typeof seg1 === "string" && isLocale(seg1);

        const rest = hasLocalePrefix ? segments.slice(2).join("/") : segments.slice(1).join("/");
        const newPath = `/${nextLocale}${rest ? `/${rest}` : ""}`;

        router.push(newPath);
        setOpen(false);
    }

    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            const el = rootRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t?.("openMenu") ?? "Open language menu"}
                className={[
                    "inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white/70",
                    "px-3 py-1 text-xs font-medium text-brandText transition hover:bg-white/80",
                ].join(" ")}
            >
                <span className="uppercase">{currentLocale}</span>
                <span className="text-[10px] opacity-70">▾</span>
            </button>

            <div
                className={[
                    open ? "block" : "hidden",
                    "absolute left-0 top-full mt-2 w-20 rounded-lg border border-brandBorder bg-white/95 shadow-lg backdrop-blur z-50 p-1",
                ].join(" ")}
                role="menu"
                aria-label={t?.("menuLabel") ?? "Language"}
            >
                {availableLocales.map((loc) => {
                    const active = loc === currentLocale;
                    return (
                        <button
                            key={loc}
                            type="button"
                            role="menuitem"
                            onClick={() => handleSwitch(loc)}
                            className={[
                                "w-full rounded-md px-2 py-1 text-left text-xs transition border",
                                active
                                    ? "bg-brandGreen/90 text-white border-brandGreen"
                                    : "border-transparent text-brandText hover:bg-brandSurface hover:border-brandBorder"
                            ].join(" ")}
                        >
                            {loc.toUpperCase()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
