"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";

/**
 * Nombre maximum de badges affichés simultanément dans la barre d’accueil.
 */
const MAX_BADGES = 3;

/**
 * Composant affichant une bande horizontale contenant les badges récemment
 * obtenus par l’utilisateur. Ces badges sont fournis par l’endpoint
 * `/badges/me/highlighted`, lequel sélectionne uniquement ceux dont la
 * période de mise en avant est encore valide.
 *
 * Le composant :
 * - effectue la requête réseau,
 * - valide la structure de la réponse,
 * - convertit les données API en `BadgeToastItem`,
 * - masque automatiquement le bloc si aucune donnée n’est disponible.
 *
 * @returns Un bloc affichant les badges ou `null` si rien n’est disponible.
 */
export function HomeBadgesStrip() {
    const t = useTranslations("badges");
    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        /**
         * Charge les badges mis en avant depuis l’API et met à jour
         * l’état local du composant. Protège contre les mises à jour
         * après démontage via le flag `cancelled`.
         */
        async function load() {
            setLoading(true);

            try {
                const res = await apiFetch("/badges/me/highlighted", {
                    cache: "no-store",
                });

                if (!res.ok) {
                    console.error(
                        "[HomeBadgesStrip] Unexpected response:",
                        res.status,
                        await res.text().catch(() => "<no-body>")
                    );
                    return;
                }

                const raw = await res.json();

                if (!Array.isArray(raw)) {
                    console.warn(
                        "[HomeBadgesStrip] Expected array, got:",
                        raw
                    );
                    return;
                }

                const mapped = raw
                    .map(mapApiBadgeToToastItem)
                    .slice(0, MAX_BADGES);

                if (!cancelled) {
                    setBadges(mapped);
                }
            } catch (err) {
                console.error("[HomeBadgesStrip] Loading error:", err);
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
    if (loading) return null;

    // Aucun badge → le composant reste invisible
    if (badges.length === 0) return null;

    return (
        <div
            className="
                mx-auto
                max-w-xl
                rounded-2xl
                border border-white/60
                bg-white/80
                px-4
                py-4
                shadow-lg
                backdrop-blur
                flex
                flex-col
                gap-3
                items-center
            "
        >
            {/* Titre de la section */}
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("latestBadgesTitle")}
            </div>

            {/* Liste horizontale des badges */}
            <div className="flex items-center gap-5">
                {badges.map((badge) => {
                    // Nettoyage du namespace i18n
                    const titleKey =
                        badge.titleKey?.startsWith("badges.")
                            ? badge.titleKey.slice("badges.".length)
                            : badge.titleKey;

                    return (
                        <div
                            key={badge.id}
                            className="
                                flex
                                flex-col
                                items-center
                                gap-2
                                rounded-xl
                                bg-slate-50/80
                                px-3
                                py-3
                                shadow-sm
                                min-w-[90px]
                            "
                        >
                            {/* Icône du badge */}
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                <img
                                    src={`/images/badges/${badge.iconKey ?? "default"}`}
                                    alt=""
                                    className="h-16 w-16 object-contain"
                                />
                            </div>

                            {/* Titre en dessous */}
                            <span className="text-xs font-semibold text-slate-800 text-center leading-tight">
                                {titleKey ? t(titleKey) : badge.titleKey}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
