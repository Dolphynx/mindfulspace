"use client";

/**
 * @file WorldBadgesStrip.tsx
 * @description
 * Bandeau SPA (world-v2) pour afficher les derniers badges “highlighted” avec icônes XXL.
 *
 * ✅ Problème résolu :
 * - Les popovers passaient “derrière” la card (stacking context / overflow).
 * - Solution : rendre la popover via React Portal dans `document.body` afin d'éviter
 *   tout clipping (`overflow-hidden`) et de sortir des stacking contexts parents.
 *
 * Comportement :
 * - Charge jusqu'à {@link MAX_BADGES} badges depuis `/badges/me/highlighted`.
 * - Affiche de grandes icônes qui s’étalent sur la largeur.
 * - Au clic : popover (titre + description), fermable par clic extérieur ou Escape.
 * - Si aucun badge n'est disponible : affiche un état vide (message i18n).
 */

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

const MAX_BADGES = 3;

/**
 * Retire le namespace `badges.` d'une clé i18n.
 *
 * @param key - Clé potentiellement préfixée (ex: `badges.zen10.title`).
 * @returns Clé sans namespace (ex: `zen10.title`), ou chaîne vide si invalide.
 */
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

function computePopoverPosition(anchorRect: DOMRect) {
    const gap = 12;
    const popoverWidth = 360;

    const viewportW = window.innerWidth;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const idealLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;

    const left = Math.max(12, Math.min(idealLeft, viewportW - popoverWidth - 12));
    const top = anchorRect.bottom + gap;

    return {
        top: top + scrollY,
        left: left + scrollX,
        width: popoverWidth,
    } as const;
}

function BadgePortalPopover({
                                badge,
                                t,
                                anchorRect,
                            }: {
    badge: BadgeToastItem;
    t: (k: string) => string;
    anchorRect: DOMRect;
}) {
    const title = getBadgeTitle(t, badge);
    const desc = getBadgeDescription(t, badge);

    const [mounted, setMounted] = useState(false);
    const [style, setStyle] = useState<{ top: number; left: number; width: number } | null>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        function update() {
            setStyle(computePopoverPosition(anchorRect));
        }

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [anchorRect]);

    if (!mounted || !style) return null;

    return createPortal(
        <div
            style={{
                position: "absolute",
                top: style.top,
                left: style.left,
                width: style.width,
                zIndex: 9999,
            }}
            className="rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur p-4"
        >
            <div className="flex gap-3 items-start">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-white/60">
                    <img
                        src={`/images/badges/${badge.iconKey ?? "default"}`}
                        alt=""
                        className="h-14 w-14 object-contain"
                    />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-snug">{title}</div>
                    <div className="mt-1 text-xs text-slate-600 leading-snug">{desc}</div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

function BadgeHeroButton({
                             badge,
                             t,
                             isOpen,
                             onToggle,
                             buttonRef,
                         }: {
    badge: BadgeToastItem;
    t: (k: string) => string;
    isOpen: boolean;
    onToggle: () => void;
    buttonRef: (el: HTMLButtonElement | null) => void;
}) {
    const title = getBadgeTitle(t, badge);

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onToggle}
            className={[
                "h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden shadow-md transition",
                "bg-white/70 border border-white/60",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2",
                isOpen ? "ring-2 ring-slate-300" : "hover:bg-white/90",
            ].join(" ")}
            aria-expanded={isOpen}
            aria-label={title}
            title={title}
        >
            <img
                src={`/images/badges/${badge.iconKey ?? "default"}`}
                alt=""
                className="h-full w-full object-contain p-3"
            />
        </button>
    );
}

export function WorldBadgesStrip() {
    const tBadges = useTranslations("badges");
    const tWorld = useTranslations("world");

    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [openId, setOpenId] = useState<string | null>(null);

    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // ✅ évite un popover accroché à un ancien badge
            setOpenId(null);

            setLoading(true);

            try {
                const res = await apiFetch(`/badges/me/highlighted?limit=${MAX_BADGES}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    return;
                }

                const raw = await res.json();
                if (!Array.isArray(raw)) return;

                const mapped = raw.map(mapApiBadgeToToastItem).slice(0, MAX_BADGES);
                if (!cancelled) setBadges(mapped);
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
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpenId(null);
        }

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (!openId) return;

            const target = e.target;
            if (!(target instanceof Node)) return;

            const openBtn = btnRefs.current[openId];
            if (openBtn && openBtn.contains(target)) return;

            setOpenId(null);
        }

        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [openId]);

    const openBadge = useMemo(() => badges.find((b) => b.id === openId) ?? null, [badges, openId]);

    const openAnchorRect = useMemo(() => {
        if (!openId) return null;
        const el = btnRefs.current[openId];
        return el ? el.getBoundingClientRect() : null;
    }, [openId]);

    if (loading) {
        return (
            <div className="flex items-center justify-between gap-3">
                <BadgeSkeleton />
                <BadgeSkeleton />
                <BadgeSkeleton />
            </div>
        );
    }

    if (badges.length === 0) {
        return (
            <div className="rounded-2xl bg-white/40 border border-white/40 px-4 py-3 text-xs text-slate-600">
                {tWorld("overview.recentBadgesEmpty")}
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between gap-3">
                {badges.map((badge) => {
                    const isOpen = openId === badge.id;
                    return (
                        <BadgeHeroButton
                            key={badge.id}
                            badge={badge}
                            t={tBadges}
                            isOpen={isOpen}
                            onToggle={() => setOpenId((prev) => (prev === badge.id ? null : badge.id))}
                            buttonRef={(el) => {
                                btnRefs.current[badge.id] = el;
                            }}
                        />
                    );
                })}
            </div>

            {openBadge && openAnchorRect ? (
                <BadgePortalPopover badge={openBadge} t={tBadges} anchorRect={openAnchorRect} />
            ) : null}
        </div>
    );
}

function BadgeSkeleton() {
    return <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/60 border border-white/60" />;
}
