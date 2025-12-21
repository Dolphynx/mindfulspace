"use client";

/**
 * @file HomeBadgesStrip.tsx
 * @description
 * Bandeau de badges “highlighted” affichant les derniers badges gagnés.
 *
 * @remarks
 * - Charge les badges via l’endpoint `/badges/me/highlighted`.
 * - Affiche jusqu’à {@link MAX_BADGES} icônes cliquables.
 * - Au clic : ouvre un popover descriptif.
 * - Fermeture : clic extérieur ou touche Escape.
 * - Peut se rendre en mode compact via la prop {@link HomeBadgesStripProps.compact}.
 *
 * i18n :
 * - Les titres/descriptions des badges sont traduits via le namespace `badges`.
 * - L’URL “Voir tous les badges” est construite avec la locale courante.
 */

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

/**
 * Nombre maximal de badges affichés.
 */
const MAX_BADGES = 3;

/**
 * Retire le préfixe de namespace i18n `badges.` d’une clé.
 *
 * @param key - Clé i18n potentiellement préfixée.
 * @returns Clé i18n sans préfixe (ou chaîne vide si absente).
 */
function stripBadgesNamespace(key?: string | null): string {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

/**
 * Résout le titre traduit d’un badge.
 *
 * @param t - Fonction de traduction.
 * @param badge - Badge à traduire.
 * @returns Titre localisé (ou chaîne vide).
 */
function getBadgeTitle(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.titleKey);
    return key ? t(key) : "";
}

/**
 * Résout la description traduite d’un badge.
 *
 * @param t - Fonction de traduction.
 * @param badge - Badge à traduire.
 * @returns Description localisée (ou chaîne vide).
 */
function getBadgeDescription(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.descriptionKey);
    return key ? t(key) : "";
}

/**
 * Propriétés de {@link BadgePopover}.
 */
type BadgePopoverProps = {
    /** Badge affiché dans le popover. */
    badge: BadgeToastItem;
    /** Fonction de traduction (namespace `badges`). */
    t: (k: string) => string;
    /** URL vers la page listant tous les badges. */
    hrefAllBadges: string;
    /** Alignement horizontal du popover (droite ou gauche). */
    align?: "right" | "left";
};

/**
 * Popover présentant le détail d’un badge.
 *
 * @param props - Propriétés du popover.
 * @returns Popover prêt à être rendu dans le flux DOM.
 */
function BadgePopover({ badge, t, hrefAllBadges, align = "right" }: BadgePopoverProps) {
    const title = getBadgeTitle(t, badge);
    const desc = getBadgeDescription(t, badge);
    const iconSrc = `/images/badges/${badge.iconKey ?? "default"}`;

    return (
        <div
            className={[
                "absolute z-50 mt-2 w-[300px] rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur p-3",
                align === "right" ? "right-0" : "left-0",
            ].join(" ")}
            role="dialog"
            aria-label={title || "Badge"}
        >
            <div className="flex gap-3 items-start">
                <div className="relative h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                    <Image
                        src={iconSrc}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain"
                    />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-snug">{title}</div>
                    <div className="mt-1 text-xs text-slate-600 leading-snug">{desc}</div>

                    <div className="mt-2">
                        <Link
                            href={hrefAllBadges}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800 underline underline-offset-2"
                        >
                            {t("viewAllBadgesLink")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Propriétés de {@link BadgeIconButton}.
 */
type BadgeIconButtonProps = {
    /** Badge associé au bouton. */
    badge: BadgeToastItem;
    /** Fonction de traduction (namespace `badges`). */
    t: (k: string) => string;
    /** Indique si le popover associé est ouvert. */
    isOpen: boolean;
    /** Toggle d’ouverture/fermeture du popover. */
    onToggle: () => void;
};

/**
 * Bouton icône représentant un badge.
 *
 * @param props - Propriétés du bouton.
 * @returns Bouton accessible affichant l’icône du badge.
 */
function BadgeIconButton({ badge, t, isOpen, onToggle }: BadgeIconButtonProps) {
    const title = getBadgeTitle(t, badge);
    const iconSrc = `/images/badges/${badge.iconKey ?? "default"}`;

    return (
        <button
            type="button"
            onClick={onToggle}
            className={[
                "relative h-9 w-9 rounded-full overflow-hidden shadow-sm transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                isOpen ? "ring-2 ring-slate-300" : "hover:opacity-90",
            ].join(" ")}
            aria-expanded={isOpen}
            aria-label={title}
            title={title}
        >
            <Image
                src={iconSrc}
                alt=""
                fill
                sizes="36px"
                className="object-contain"
            />
        </button>
    );
}

/**
 * Propriétés de {@link HomeBadgesStrip}.
 */
export type HomeBadgesStripProps = {
    /**
     * Active la variante compacte (panneau plus petit, aligné à droite).
     *
     * @defaultValue false
     */
    compact?: boolean;
};

/**
 * Bandeau affichant les derniers badges “highlighted”.
 *
 * @param props - Propriétés du bandeau.
 * @returns Bandeau de badges, ou `null` si aucun badge n’est disponible.
 */
export function HomeBadgesStrip({ compact = false }: HomeBadgesStripProps) {
    const t = useTranslations("badges");

    /**
     * Locale courante résolue via les paramètres de route.
     */
    const params = useParams<{ locale?: string }>();
    const raw = params.locale ?? defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const hrefAllBadges = `/${locale}/member/badges`;

    /**
     * Rafraîchissement optionnel si le WorldHubProvider est présent.
     */
    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setOpenId(null);
            setLoading(true);

            try {
                const res = await apiFetch("/badges/me/highlighted", { cache: "no-store" });

                if (!res.ok) {
                    console.error(
                        "[HomeBadgesStrip] Unexpected response:",
                        res.status,
                        await res.text().catch(() => "<no-body>"),
                    );
                    if (!cancelled) setBadges([]);
                    return;
                }

                const rawJson = (await res.json()) as unknown;

                if (!Array.isArray(rawJson)) {
                    console.warn("[HomeBadgesStrip] Expected array, got:", rawJson);
                    if (!cancelled) setBadges([]);
                    return;
                }

                const mapped = rawJson.map(mapApiBadgeToToastItem).slice(0, MAX_BADGES);
                if (!cancelled) setBadges(mapped);
            } catch (err) {
                console.error("[HomeBadgesStrip] Loading error:", err);
                if (!cancelled) setBadges([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (!wrapRef.current) return;
            if (e.target instanceof Node && !wrapRef.current.contains(e.target)) {
                setOpenId(null);
            }
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpenId(null);
        }

        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const openBadge = useMemo(
        () => badges.find((b) => b.id === openId) ?? null,
        [badges, openId],
    );

    if (loading) return null;
    if (badges.length === 0) return null;

    const wrapperZ = openBadge ? "z-50" : "z-10";

    if (compact) {
        return (
            <div
                ref={wrapRef}
                className={[
                    "relative rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-md backdrop-blur",
                    wrapperZ,
                ].join(" ")}
            >
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 text-right">
                    {t("latestBadgesTitle")}
                </div>

                <div className="flex items-center justify-end gap-2">
                    {badges.map((badge) => {
                        const isOpen = openId === badge.id;
                        return (
                            <BadgeIconButton
                                key={badge.id}
                                badge={badge}
                                t={t}
                                isOpen={isOpen}
                                onToggle={() =>
                                    setOpenId((prev) => (prev === badge.id ? null : badge.id))
                                }
                            />
                        );
                    })}
                </div>

                {openBadge ? (
                    <BadgePopover
                        badge={openBadge}
                        t={t}
                        hrefAllBadges={hrefAllBadges}
                        align="right"
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div
            ref={wrapRef}
            className={[
                "relative mx-auto max-w-xl rounded-2xl border border-white/60 bg-white/80 px-4 py-4 shadow-lg backdrop-blur",
                wrapperZ,
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-slate-800">
                        {t("latestBadgesTitle")}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    {badges.map((badge) => {
                        const isOpen = openId === badge.id;
                        return (
                            <BadgeIconButton
                                key={badge.id}
                                badge={badge}
                                t={t}
                                isOpen={isOpen}
                                onToggle={() =>
                                    setOpenId((prev) => (prev === badge.id ? null : badge.id))
                                }
                            />
                        );
                    })}
                </div>
            </div>

            {openBadge ? (
                <BadgePopover
                    badge={openBadge}
                    t={t}
                    hrefAllBadges={hrefAllBadges}
                    align="right"
                />
            ) : null}
        </div>
    );
}
