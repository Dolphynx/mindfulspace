"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/i18n/TranslationContext";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

const MAX_BADGES = 3;

function stripBadgesNamespace(key?: string | null) {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

function getBadgeTitle(t: (k: string) => string, badge: BadgeToastItem) {
    const key = stripBadgesNamespace(badge.titleKey);
    if (!key) return "";
    return t(key);
}

function getBadgeDescription(t: (k: string) => string, badge: BadgeToastItem) {
    const key = stripBadgesNamespace(badge.descriptionKey);
    if (!key) return "";
    return t(key);
}

function BadgePopover({
                          badge,
                          t,
                          hrefAllBadges,
                          align = "right",
                      }: {
    badge: BadgeToastItem;
    t: (k: string) => string;
    hrefAllBadges: string;
    align?: "right" | "left";
}) {
    const title = getBadgeTitle(t, badge);
    const desc = getBadgeDescription(t, badge);

    return (
        <div
            className={[
                "absolute z-50 mt-2 w-[300px] rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur p-3",
                align === "right" ? "right-0" : "left-0",
            ].join(" ")}
        >
            <div className="flex gap-3 items-start">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                    <img
                        src={`/images/badges/${badge.iconKey ?? "default"}`}
                        alt=""
                        className="h-12 w-12 object-contain"
                    />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-snug">
                        {title}
                    </div>
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

function BadgeIconButton({
                             badge,
                             t,
                             isOpen,
                             onToggle,
                         }: {
    badge: BadgeToastItem;
    t: (k: string) => string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const title = getBadgeTitle(t, badge);

    return (
        <button
            type="button"
            onClick={onToggle}
            className={[
                "h-9 w-9 rounded-full overflow-hidden shadow-sm transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                isOpen ? "ring-2 ring-slate-300" : "hover:opacity-90",
            ].join(" ")}
            aria-expanded={isOpen}
            aria-label={title}
            title={title}
        >
            <img
                src={`/images/badges/${badge.iconKey ?? "default"}`}
                alt=""
                className="h-9 w-9 object-contain"
            />
        </button>
    );
}

export function HomeBadgesStrip({ compact = false }: { compact?: boolean }) {
    const t = useTranslations("badges");

    const pathname = usePathname();
    const raw = pathname.split("/")[1] || defaultLocale;
    const locale: Locale = isLocale(raw) ? raw : defaultLocale;
    const hrefAllBadges = `/${locale}/member/badges`;

    // ✅ World refresh (optionnel)
    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // ✅ évite popover “accroché” si la liste change
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

                const raw = await res.json();

                if (!Array.isArray(raw)) {
                    console.warn("[HomeBadgesStrip] Expected array, got:", raw);
                    if (!cancelled) setBadges([]);
                    return;
                }

                const mapped = raw.map(mapApiBadgeToToastItem).slice(0, MAX_BADGES);

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
        // ✅ re-fetch quand bumpRefreshKey() est appelé (si WorldHubProvider est présent)
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
