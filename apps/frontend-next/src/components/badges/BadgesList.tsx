"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Locale } from "@/i18n/config";
import { formatEarnedAt, stripBadgesNamespace, type UiUserBadge } from "@/components";

type Props = {
    badges: UiUserBadge[];
    loading: boolean;
    locale: Locale;
    variant?: "page" | "drawer";
};

/**
 * Liste de badges (skeleton / empty / grid).
 *
 * @remarks
 * - `variant="drawer"` réduit un peu les paddings pour le panel.
 * - La navigation (back/close) est gérée par le panel, donc pas ici.
 */
export function BadgesList({ badges, loading, locale, variant = "page" }: Props) {
    const t = useTranslations("badges");
    const count = badges.length;

    const items = useMemo(() => {
        return badges.map((b) => {
            const titleKey = stripBadgesNamespace(b.titleKey);
            const descriptionKey = stripBadgesNamespace(b.descriptionKey);

            return {
                ...b,
                title: titleKey ? t(titleKey) : b.titleKey,
                description: descriptionKey ? t(descriptionKey) : "",
                earnedLabel: formatEarnedAt(b.earnedAt, locale),
            };
        });
    }, [badges, locale, t]);

    const headerBadgeIconKey = items[0]?.iconKey ?? "default";
    const cardBase =
        "rounded-3xl border border-white/40 bg-white/55 shadow-lg backdrop-blur p-4 hover:bg-white/70 transition";
    const wrapPad = variant === "drawer" ? "" : "px-6 py-5";

    return (
        <div className="space-y-5">
            {/* Header compact réutilisable (en drawer on le garde, c’est utile) */}
            <div className={`rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur ${wrapPad}`}>
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-3xl bg-white/70 border border-white/50 shadow-sm flex items-center justify-center shrink-0">
                        <img
                            src={`/images/badges/${headerBadgeIconKey}`}
                            alt=""
                            className="h-16 w-16 object-contain"
                        />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-lg font-semibold text-slate-800">
                            {t?.("allBadgesTitle") ?? "Badges"}
                        </div>

                        <div className="text-sm text-slate-600">
                            {loading
                                ? (t?.("loading") ?? "Chargement…")
                                : count === 0
                                    ? (t?.("noBadgesYet") ?? "Aucun badge pour le moment.")
                                    : (t?.("badgesCount") ?? "{count} badges obtenus").replace("{count}", String(count))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-3xl border border-white/40 bg-white/45 shadow-md backdrop-blur p-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                                    <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur p-6 text-slate-700">
                    <div className="text-sm">
                        {t?.("noBadgesYetLong") ??
                            "Continue les activités (sommeil, méditation, exercice) pour débloquer des badges."}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((b) => (
                        <article key={b.id} className={cardBase}>
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/70 overflow-hidden shadow-sm shrink-0 flex items-center justify-center border border-white/50">
                                    <img
                                        src={`/images/badges/${b.iconKey ?? "default"}`}
                                        alt=""
                                        className="h-14 w-14 object-contain"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-semibold text-slate-800 leading-snug truncate">
                                            {b.title}
                                        </div>

                                        <span className="shrink-0 rounded-full border border-slate-200/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {b.earnedLabel}
                    </span>
                                    </div>

                                    {b.description ? (
                                        <p className="mt-1 text-xs text-slate-600 leading-snug">
                                            {b.description}
                                        </p>
                                    ) : null}

                                    <div className="mt-3 text-[11px] text-slate-500">
                                        {t?.("earnedOnLabel") ?? "Obtenu le"} {b.earnedLabel}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
