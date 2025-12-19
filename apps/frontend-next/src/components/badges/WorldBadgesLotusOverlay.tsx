"use client";

/**
 * @file WorldBadgesLotusOverlay.tsx
 * @description
 * Overlay World V2 : affiche les N derniers badges gagnés sous forme de lotus sur la map.
 *
 * ✅ Améliorations :
 * - Lotus plus petits (et responsive)
 * - Popover fermable par clic extérieur + Escape
 * - Popover fermable via event global (ex: clic sur “Démarrer”)
 *
 * Data :
 * - Charge les badges via `/badges/me?limit=7`
 */

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { apiFetch } from "@/lib/api/client";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

import type { BadgeToastItem } from "@/types/badges";

const MAX_BADGES = 7;

/**
 * Event global pour fermer les popovers depuis n'importe où (ex: bouton "Démarrer").
 */
const CLOSE_EVENT = "world:close-badge-popovers";

/**
 * Positions (en %) dans le conteneur `relative aspect-[16/9]`.
 */
const LOTUS_POSITIONS: Array<{ xPct: number; yPct: number }> = [
    { xPct: 20, yPct: 30 },
    { xPct: 28, yPct: 60 },
    { xPct: 36, yPct: 35 },
    { xPct: 47, yPct: 60 },
    { xPct: 53, yPct: 25 },
    { xPct: 70, yPct: 50 },
    { xPct: 80, yPct: 20 },
];

/* -------------------------------------------------------------------------- */
/*                                UTILITAIRES                                 */
/* -------------------------------------------------------------------------- */

function stripBadgesNamespace(key?: string | null): string {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

function getBadgeTitle(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.titleKey);
    return key ? t(key) : "";
}

function getBadgeDescription(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.descriptionKey);
    return key ? t(key) : "";
}

function computePopoverPosition(anchorRect: DOMRect) {
    const gap = 12;
    const popoverWidth = 360;

    const idealLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;

    const left = Math.max(12, Math.min(idealLeft, window.innerWidth - popoverWidth - 12));

    return {
        top: anchorRect.bottom + gap + window.scrollY,
        left: left + window.scrollX,
        width: popoverWidth,
    } as const;
}

/* -------------------------------------------------------------------------- */
/*                                  POPOVER                                   */
/* -------------------------------------------------------------------------- */

function BadgePortalPopover({
                                badge,
                                t,
                                anchorRect,
                                onRequestClose,
                            }: {
    badge: BadgeToastItem;
    t: (k: string) => string;
    anchorRect: DOMRect;
    onRequestClose: () => void;
}) {
    const title = getBadgeTitle(t, badge);
    const desc = getBadgeDescription(t, badge);

    const [mounted, setMounted] = useState(false);
    const [style, setStyle] = useState<{ top: number; left: number; width: number } | null>(null);

    const popoverRef = useRef<HTMLDivElement | null>(null);

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

    // ✅ Fermer par clic extérieur + Escape + event global
    useEffect(() => {
        function onPointerDown(e: MouseEvent | TouchEvent) {
            const el = popoverRef.current;
            if (!el) return;
            const target = e.target as Node | null;
            if (target && !el.contains(target)) onRequestClose();
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onRequestClose();
        }

        function onCloseEvent() {
            onRequestClose();
        }

        document.addEventListener("mousedown", onPointerDown, true);
        document.addEventListener("touchstart", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener(CLOSE_EVENT, onCloseEvent);

        return () => {
            document.removeEventListener("mousedown", onPointerDown, true);
            document.removeEventListener("touchstart", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener(CLOSE_EVENT, onCloseEvent);
        };
    }, [onRequestClose]);

    if (!mounted || !style) return null;

    const iconSrc = `/images/badges/${badge.iconKey ?? "default"}`;

    return createPortal(
        <div
            ref={popoverRef}
            style={{
                position: "absolute",
                top: style.top,
                left: style.left,
                width: style.width,
                zIndex: 9999,
            }}
            className="rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur p-4"
            role="dialog"
            aria-label={title || "Badge"}
        >
            <div className="flex gap-3 items-start">
                <div className="relative h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-white/60">
                    <Image src={iconSrc} alt="" fill className="object-contain p-2" />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{title}</div>
                    <div className="mt-1 text-xs text-slate-600">{desc}</div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/* -------------------------------------------------------------------------- */
/*                               MARKER LOTUS                                 */
/* -------------------------------------------------------------------------- */

function LotusBadgeMarker({
                              badge,
                              size,
                              onClick,
                              buttonRef,
                          }: {
    badge: BadgeToastItem;
    size: number;
    onClick: () => void;
    buttonRef: (el: HTMLButtonElement | null) => void;
}) {
    const badgeSrc = `/images/badges/${badge.iconKey ?? "default"}`;

    // Icône centrale légèrement plus petite
    const iconSize = Math.round(size * 0.55);

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            className="relative transition hover:scale-[1.03] focus:outline-none"
            style={{ width: size, height: size }}
            aria-label="badge"
        >
            {/* Lotus */}
            <div className="absolute inset-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.16)]">
                <Image
                    src="/images/badges/badge-lotus-bg.png"
                    alt=""
                    width={size}
                    height={size}
                    className="h-full w-full object-contain"
                />
            </div>

            {/* Icône badge */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: iconSize, height: iconSize }}>
                    <Image src={badgeSrc} alt="" fill className="object-contain drop-shadow-sm" />
                </div>
            </div>
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*                             MAPPING TYPÉ (❌ any)                           */
/* -------------------------------------------------------------------------- */

type ApiBadgeDefinitionDto = {
    slug: string;
    titleKey: string;
    descriptionKey: string | null;
    iconKey: string | null;
};

type ApiUserBadgeDto = {
    id: string;
    earnedAt: string; // JSON => string (date-time)
    badge: ApiBadgeDefinitionDto;
};

function mapUserBadgeDtoToToastItem(raw: ApiUserBadgeDto): BadgeToastItem {
    return {
        id: raw.id,
        slug: raw.badge.slug,
        titleKey: raw.badge.titleKey,
        // ton BadgeToastItem attend string non-null -> fallback sûr
        descriptionKey: raw.badge.descriptionKey ?? "",
        iconKey: raw.badge.iconKey,
        // on normalise en ISO (au cas où l’API renverrait un format différent)
        earnedAt: new Date(raw.earnedAt).toISOString(),
    };
}

/* -------------------------------------------------------------------------- */
/*                               OVERLAY FINAL                                */
/* -------------------------------------------------------------------------- */

export function WorldBadgesLotusOverlay() {
    const tBadges = useTranslations("badges");

    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);

    const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // ✅ évite un popover “accroché” à un ancien DOM rect
            setOpenId(null);

            const res = await apiFetch(`/badges/me?limit=${MAX_BADGES}`, {
                cache: "no-store",
            });

            if (!res.ok) return;

            const raw = (await res.json()) as ApiUserBadgeDto[];

            if (!Array.isArray(raw)) {
                console.warn("[WorldBadgesLotusOverlay] Expected array, got:", raw);
                return;
            }

            const mapped = raw.map(mapUserBadgeDtoToToastItem).slice(0, MAX_BADGES);
            if (!cancelled) setBadges(mapped);
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const openBadge = useMemo(() => badges.find((b) => b.id === openId) ?? null, [badges, openId]);

    const openAnchorRect = useMemo(() => {
        if (!openId) return null;
        return markerRefs.current[openId]?.getBoundingClientRect() ?? null;
    }, [openId]);

    if (badges.length === 0) return null;

    // Lotus
    const markerSize = 64;

    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            {badges.map((badge, i) => {
                const pos = LOTUS_POSITIONS[i] ?? LOTUS_POSITIONS.at(-1)!;

                return (
                    <div
                        key={badge.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
                    >
                        <div className="sm:hidden">
                            <LotusBadgeMarker
                                badge={badge}
                                size={markerSize}
                                onClick={() => setOpenId((prev) => (prev === badge.id ? null : badge.id))}
                                buttonRef={(el) => {
                                    markerRefs.current[badge.id] = el;
                                }}
                            />
                        </div>

                        <div className="hidden sm:block lg:hidden">
                            <LotusBadgeMarker
                                badge={badge}
                                size={76}
                                onClick={() => setOpenId((prev) => (prev === badge.id ? null : badge.id))}
                                buttonRef={(el) => {
                                    markerRefs.current[badge.id] = el;
                                }}
                            />
                        </div>

                        <div className="hidden lg:block">
                            <LotusBadgeMarker
                                badge={badge}
                                size={80}
                                onClick={() => setOpenId((prev) => (prev === badge.id ? null : badge.id))}
                                buttonRef={(el) => {
                                    markerRefs.current[badge.id] = el;
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            {openBadge && openAnchorRect ? (
                <BadgePortalPopover
                    badge={openBadge}
                    t={tBadges}
                    anchorRect={openAnchorRect}
                    onRequestClose={() => setOpenId(null)}
                />
            ) : null}
        </div>
    );
}
