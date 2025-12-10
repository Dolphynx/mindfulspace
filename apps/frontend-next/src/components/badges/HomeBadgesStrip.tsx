"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";

/**
 * Nombre maximum de badges visibles affichés dans la barre d’accueil.
 */
const MAX_BADGES = 3;

/**
 * Composant responsable de l’affichage d’une bande de badges récemment obtenus,
 * visibles uniquement lorsque l’utilisateur détient des badges dits “mis en avant”.
 *
 * Le composant :
 * - charge les badges via l’endpoint `/badges/me/highlighted`
 * - convertit les données API en objets front (`BadgeToastItem`)
 * - limite l’affichage à {@link MAX_BADGES}
 * - masque automatiquement le rendu si aucun badge n’est disponible
 *
 * @returns Un bloc affichant les badges ou `null` si rien n'est à afficher.
 */
export function HomeBadgesStrip() {
    const t = useTranslations("badges");
    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        /**
         * Charge les badges mis en avant pour l’utilisateur courant.
         * Gère les états de chargement, les erreurs réseau et protège
         * contre les mises à jour de state après démontage du composant.
         */
        async function load() {
            setLoading(true);
            try {
                console.log("[HomeBadgesStrip] fetching highlighted badges...");

                const res = await apiFetch("/badges/me/highlighted", {
                    cache: "no-store",
                });

                console.log(
                    "[HomeBadgesStrip] response status =",
                    res.status,
                );

                if (!res.ok) {
                    const text = await res.text().catch(() => "<no body>");
                    console.error(
                        "[HomeBadgesStrip] non-OK response:",
                        res.status,
                        text,
                    );
                    return;
                }

                const data = (await res.json()) as unknown;

                console.log("[HomeBadgesStrip] raw data =", data);

                if (!Array.isArray(data)) {
                    console.warn(
                        "[HomeBadgesStrip] Expected an array, got:",
                        data,
                    );
                    return;
                }

                const mapped = data
                    .map((b) => mapApiBadgeToToastItem(b))
                    .slice(0, MAX_BADGES);

                console.log(
                    "[HomeBadgesStrip] mapped badges =",
                    mapped,
                );

                if (!cancelled) {
                    setBadges(mapped);
                }
            } catch (e) {
                console.error(
                    "[HomeBadgesStrip] Error while loading badges:",
                    e,
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    // Aucun rendu pendant le chargement
    if (loading) {
        return null;
    }

    // Aucun badge à afficher → pas de rendu
    if (badges.length === 0) {
        return null;
    }

    return (
        <div
            className="
                mx-auto
                max-w-xl
                rounded-2xl
                border border-white/60
                bg-white/80
                px-4
                py-3
                shadow-lg
                backdrop-blur
                flex
                flex-col
                gap-2
                items-center
            "
        >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("latestBadgesTitle")}
            </div>

            <div className="flex items-center gap-3">
                {badges.map((badge) => {
                    // On enlève le préfixe "badges." parce qu'on est déjà
                    // dans le namespace "badges".
                    const titleKey =
                        badge.titleKey &&
                        (badge.titleKey.startsWith("badges.")
                            ? badge.titleKey.slice("badges.".length)
                            : badge.titleKey);

                    const descriptionKey =
                        badge.descriptionKey &&
                        (badge.descriptionKey.startsWith("badges.")
                            ? badge.descriptionKey.slice("badges.".length)
                            : badge.descriptionKey);

                    return (
                    <div
                        key={badge.id}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-slate-50/80
                            px-3
                            py-2
                            shadow-sm
                        "
                    >
                        <div className="h-12 w-12 shrink-0 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            {badge.iconKey ? (
                                <img
                                    src={`/images/badges/${badge.iconKey}`}
                                    alt=""
                                    className="h-12 w-12 object-contain"
                                />
                            ) : (
                                <img
                                    src={`/images/badges/default`}
                                    alt=""
                                    className="h-12 w-12 object-contain"
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800">
                                {titleKey ? t(titleKey) : badge.titleKey}
                            </span>
                            {/*badge.descriptionKey && (
                                <span className="text-[11px] text-slate-500">
                                    {t(descriptionKey)}
                                </span>
                            )*/}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
