"use client";

/**
 * @file LanguageSwitcher.tsx
 * @description
 * Sélecteur de langue (FR/EN) basé sur l’URL.
 *
 * @remarks
 * - Résout la locale courante via les paramètres de route Next.js (`useParams`) lorsque la route est localisée.
 * - Conserve le reste du chemin lors du changement de langue.
 * - Persiste la préférence utilisateur dans un cookie essentiel `locale`.
 *
 * @example
 * - `/fr/member/badges` → switch `en` → `/en/member/badges`
 * - `/` (sans locale) → locale par défaut (voir {@link defaultLocale})
 */

import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { locales, isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Nom du cookie stockant la locale préférée.
 */
const LOCALE_COOKIE = "locale";

/**
 * Écrit la locale préférée dans le cookie `locale`.
 *
 * @param locale - Locale cible.
 *
 * @remarks
 * - Cookie côté client : `Path=/`, `Max-Age=1 an`, `SameSite=Lax`.
 * - Ajoute `Secure` en production.
 */
function setLocaleCookie(locale: Locale) {
    const oneYear = 60 * 60 * 24 * 365;

    document.cookie =
        `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax` +
        (process.env.NODE_ENV === "production" ? "; Secure" : "");
}

/**
 * Composant de bascule de langue.
 *
 * @remarks
 * - Utilise `useParams` pour lire la locale courante lorsqu’elle est présente dans le segment `[locale]`.
 * - Utilise `usePathname` pour reconstruire le chemin complet en conservant le reste de la route.
 *
 * @returns Sélecteur de langue sous forme de boutons.
 */
export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("langSwitcher");

    /**
     * Locale courante résolue depuis les paramètres de route.
     *
     * @remarks
     * En cas de paramètre absent ou invalide, retombe sur {@link defaultLocale}.
     */
    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const currentLocale: Locale = isLocale(raw) ? raw : defaultLocale;

    /**
     * Segments du chemin courant.
     *
     * @remarks
     * `pathname` commence par `/`, donc `split("/")` produit typiquement :
     * `["", "fr", "member", "..."]`.
     */
    const segments = pathname.split("/");

    /**
     * Locales disponibles dans le switcher.
     *
     * @remarks
     * Cette liste est alignée avec la configuration i18n globale.
     */
    const availableLocales: readonly Locale[] = locales;

    /**
     * Bascule de langue en conservant la route actuelle.
     *
     * @param nextLocale - Locale à activer.
     *
     * @remarks
     * - Si la locale demandée est identique à la locale courante, ne fait rien.
     * - Stocke la préférence dans un cookie essentiel.
     * - Reconstruit le chemin en remplaçant le préfixe de locale si présent.
     */
    function handleSwitch(nextLocale: Locale) {
        if (nextLocale === currentLocale) return;

        setLocaleCookie(nextLocale);

        const seg1 = segments[1];
        const hasLocalePrefix = typeof seg1 === "string" && isLocale(seg1);

        const rest = hasLocalePrefix ? segments.slice(2).join("/") : segments.slice(1).join("/");
        const newPath = `/${nextLocale}${rest ? `/${rest}` : ""}`;

        router.push(newPath);
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white/70 px-3 py-1 text-xs">
            <div className="flex items-center gap-1">
                {availableLocales.map((loc) => (
                    <button
                        key={loc}
                        type="button"
                        onClick={() => handleSwitch(loc)}
                        aria-pressed={loc === currentLocale}
                        aria-label={
                            t?.("switchTo")
                                ? `${t("switchTo")} ${loc.toUpperCase()}`
                                : `Switch to ${loc.toUpperCase()}`
                        }
                        className={[
                            "px-2 py-0.5 rounded-full border text-[11px] font-medium transition",
                            loc === currentLocale
                                ? "bg-brandGreen text-white border-brandGreen"
                                : "bg-transparent text-brandText-soft border-transparent hover:bg-brandBg",
                        ].join(" ")}
                    >
                        {loc.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}
