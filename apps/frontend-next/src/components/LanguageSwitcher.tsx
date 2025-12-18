"use client";

/**
 * Sélecteur de langue (FR/EN) basé sur l’URL.
 *
 * @remarks
 * - Détermine la locale courante à partir du premier segment du chemin (`/fr/...`, `/en/...`).
 * - Change de langue en conservant le reste du chemin.
 * - Persiste la préférence utilisateur dans un cookie essentiel `locale`.
 *
 * @example
 * - `/fr/member/badges` → switch `en` → `/en/member/badges`
 * - `/` (sans locale) → locale par défaut (voir {@link defaultLocale})
 */

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { locales, isLocale, defaultLocale, type Locale } from "@/i18n/config";

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

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("langSwitcher");

    /**
     * Segments de l'URL courante.
     *
     * @remarks
     * `pathname` commence par `/`, donc `split("/")` donne typiquement :
     * - `["", "fr", "member", "..."]`
     */
    const segments = pathname.split("/");

    /**
     * Locale courante résolue depuis le premier segment.
     *
     * @remarks
     * En cas de segment absent/invalide, retombe sur {@link defaultLocale}.
     */
    const currentRaw = segments[1] || defaultLocale;
    const currentLocale: Locale = isLocale(currentRaw) ? currentRaw : defaultLocale;

    /**
     * Locales disponibles dans le switcher.
     *
     * @remarks
     * Cette liste est alignée avec la configuration i18n globale.
     */
    //const LOCALES: Locale[] = ["fr", "en"];
    const LOCALES: readonly Locale[] = locales;

    /**
     * Bascule de langue en conservant la route actuelle.
     *
     * @param nextLocale - Locale à activer.
     *
     * @remarks
     * - Si la locale demandée est identique à la locale courante, ne fait rien.
     * - Stocke la préférence dans un cookie essentiel.
     * - Reconstruit le chemin en remplaçant uniquement le segment de locale.
     * - Si un jour il y a des routes sans /locale/ => le chemin sera incorrect !!!
     */
    function handleSwitch(nextLocale: Locale) {
        if (nextLocale === currentLocale) return;

        setLocaleCookie(nextLocale);

        const rest = segments.slice(2).join("/");
        const newPath = "/" + nextLocale + (rest ? "/" + rest : "");

        router.push(newPath);
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white/70 px-3 py-1 text-xs">
            <div className="flex items-center gap-1">
                {LOCALES.map((loc) => (
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
