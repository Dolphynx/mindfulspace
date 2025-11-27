"use client";

/**
 * LanguageSwitcher
 * ----------------
 * Petit sélecteur de langue affiché dans le layout public.
 *
 * Comportement :
 * - Détecte la locale actuelle à partir de l’URL : /fr/... ou /en/...
 * - Permet de basculer entre les locales sans perdre la page courante :
 *   ex. /fr/resources  -> /en/resources
 *
 * Implémentation :
 * - Utilise `usePathname` pour lire le chemin actuel.
 * - Utilise `useRouter().push()` pour naviguer vers la même route
 *   en remplaçant uniquement le segment de locale.
 */

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("langSwitcher");

    // Découpe du chemin : "", "fr", "client", "dashboard", ...
    const segments = pathname.split("/");

    const currentRaw = segments[1] || defaultLocale;
    const currentLocale: Locale = isLocale(currentRaw)
        ? currentRaw
        : defaultLocale;

    const LOCALES: Locale[] = ["fr", "en"];

    function handleSwitch(nextLocale: Locale) {
        if (nextLocale === currentLocale) return;

        // on garde le "reste" du chemin après la locale
        const rest = segments.slice(2).join("/");
        const newPath =
            "/" + nextLocale + (rest ? "/" + rest : "");

        router.push(newPath);
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-brandBorder bg-white/70 px-3 py-1 text-xs">
            {/*<span className="text-brandText-soft">
                {t("label")}
            </span>*/}
            <div className="flex items-center gap-1">
                {LOCALES.map((loc) => (
                    <button
                        key={loc}
                        type="button"
                        onClick={() => handleSwitch(loc)}
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
