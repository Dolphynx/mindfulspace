"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

import { apiFetch } from "@/lib/api/client";
import OceanWavesBackground from "@/components/layout/OceanWavesBackground";

/**
 * Retire le namespace `badges.` d'une clé i18n afin d'utiliser la clé relative
 * attendue par le scope `useTranslations("badges")`.
 */
function stripBadgesNamespace(key?: string | null) {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

type ApiUserBadgeDto = {
    id: string;
    earnedAt: string; // ISO string côté HTTP
    metricValueAtEarn: number;
    badge: {
        id: string;
        slug: string;
        titleKey: string;
        descriptionKey: string | null;
        iconKey: string | null;
    };
};

type UiUserBadge = {
    id: string;
    earnedAt: Date;
    titleKey: string;
    descriptionKey: string | null;
    iconKey: string | null;
    slug: string;
};

function formatEarnedAt(d: Date, locale: Locale) {
    try {
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(d);
    } catch {
        return d.toLocaleDateString();
    }
}

export default function MemberBadgesPage() {
    const t = useTranslations("badges");

    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;

    const [badges, setBadges] = useState<UiUserBadge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const res = await apiFetch("/badges/me", { cache: "no-store" });

                if (!res.ok) {
                    console.error(
                        "[MemberBadgesPage] Unexpected response:",
                        res.status,
                        await res.text().catch(() => "<no-body>"),
                    );
                    return;
                }

                const raw = (await res.json()) as unknown;

                if (!Array.isArray(raw)) {
                    console.warn("[MemberBadgesPage] Expected array, got:", raw);
                    return;
                }

                const mapped: UiUserBadge[] = (raw as ApiUserBadgeDto[]).map((ub) => ({
                    id: ub.id,
                    earnedAt: new Date(ub.earnedAt),
                    titleKey: ub.badge?.titleKey ?? "",
                    descriptionKey: ub.badge?.descriptionKey ?? null,
                    iconKey: ub.badge?.iconKey ?? null,
                    slug: ub.badge?.slug ?? "",
                }));

                if (!cancelled) setBadges(mapped);
            } catch (err) {
                console.error("[MemberBadgesPage] Loading error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

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

    return (
        <OceanWavesBackground headerOffsetPx={80} wavesHeight="80vh">
            <div className="mx-auto w-[92%] max-w-6xl pt-6 pb-24">
                {/* Header (un peu plus léger) */}
                <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur px-6 py-5">
                    <div className="flex items-center gap-5">
                        {/* Grande icône (dernier badge) */}
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-white/70 border border-white/50 shadow-sm flex items-center justify-center shrink-0">
                            <img
                                src={`/images/badges/${headerBadgeIconKey}`}
                                alt=""
                                className="h-16 w-16 md:h-20 md:w-20 object-contain"
                            />
                        </div>

                        {/* Texte */}
                        <div className="flex flex-col gap-1 min-w-0">
                            <h1 className="text-lg md:text-2xl font-semibold text-slate-800">
                                {t?.("allBadgesTitle") ?? "Badges"}
                            </h1>

                            <p className="text-sm md:text-base text-slate-600">
                                {loading
                                    ? (t?.("loading") ?? "Chargement…")
                                    : count === 0
                                        ? (t?.("noBadgesYet") ?? "Aucun badge pour le moment.")
                                        : (t?.("badgesCount") ?? "{count} badges obtenus").replace(
                                            "{count}",
                                            String(count),
                                        )}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Content */}
                <div className="mt-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-3xl border border-white/40 bg-white/45 shadow-md backdrop-blur p-4"
                                >
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((b) => (
                                <article
                                    key={b.id}
                                    className="group rounded-3xl border border-white/40 bg-white/55 shadow-lg backdrop-blur p-4 hover:bg-white/70 transition"
                                >
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
            </div>
        </OceanWavesBackground>
    );
}
