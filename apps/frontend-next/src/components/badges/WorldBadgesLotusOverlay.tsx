"use client";

/**
 * @file WorldBadgesLotusOverlay.tsx
 * @description
 * Overlay World V2 affichant les derniers badges gagnés sous forme de marqueurs “lotus”
 * positionnés sur la carte, avec un popover rendu en portal.
 *
 * @remarks
 * - Les badges sont chargés depuis l’endpoint `/badges/me?limit=7`.
 * - Le popover est rendu dans `document.body` via React Portal afin d’éviter les problèmes
 *   de clipping (`overflow-hidden`) et de stacking contexts (cartes/containers parents).
 * - La fermeture du popover est supportée par :
 *   - clic/touch extérieur,
 *   - touche Escape,
 *   - événement global `world:close-badge-popovers` (utilisable depuis d’autres composants).
 */

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/i18n/TranslationContext";
import { apiFetch } from "@/lib/api/client";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

import type { BadgeToastItem } from "@/types/badges";

import { useLotusOverlayLayout } from "@/components/badges/useLotusOverlayLayout";
import { LotusOverlayView } from "@/components/badges/LotusOverlayView";

/**
 * Nombre maximal de badges affichés sur la carte.
 */
const MAX_BADGES = 7;

/**
 * Nom de l’événement global permettant de fermer tous les popovers de badges.
 *
 * @remarks
 * Cet événement peut être dispatché depuis n’importe quel composant (ex. CTA “Démarrer”)
 * afin de garantir qu’aucun popover ne reste ouvert lors d’une transition d’UI.
 */
const CLOSE_EVENT = "world:close-badge-popovers";

/* -------------------------------------------------------------------------- */
/*                                 UTILITAIRES                                */
/* -------------------------------------------------------------------------- */

/**
 * Supprime le namespace `badges.` d’une clé i18n si présent.
 *
 * @param key - Clé potentiellement préfixée (ex. `badges.someKey`).
 * @returns Clé normalisée sans préfixe.
 */
function stripBadgesNamespace(key?: string | null): string {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

/**
 * Résout le titre localisé d’un badge.
 *
 * @param t - Fonction de traduction.
 * @param badge - Badge à afficher.
 * @returns Titre localisé (ou chaîne vide si clé manquante).
 */
function getBadgeTitle(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.titleKey);
    return key ? t(key) : "";
}

/**
 * Résout la description localisée d’un badge.
 *
 * @param t - Fonction de traduction.
 * @param badge - Badge à afficher.
 * @returns Description localisée (ou chaîne vide si clé manquante).
 */
function getBadgeDescription(t: (k: string) => string, badge: BadgeToastItem): string {
    const key = stripBadgesNamespace(badge.descriptionKey);
    return key ? t(key) : "";
}

/**
 * Calcule la position d’un popover en se basant sur le rectangle d’ancrage du marker.
 *
 * @remarks
 * - Le popover est centré idéalement par rapport au marker.
 * - La position est contrainte horizontalement dans la fenêtre afin d’éviter le débordement.
 * - Le calcul tient compte du scroll (via `window.scrollX/Y`).
 *
 * @param anchorRect - Rectangle de référence du marker (viewport).
 * @returns Style positionnel pour le popover (top/left/width).
 */
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
/*                                   POPOVER                                  */
/* -------------------------------------------------------------------------- */

/**
 * Popover rendu en Portal, attaché visuellement à un marker de badge.
 *
 * @remarks
 * Le popover :
 * - s’auto-positionne sur `resize` et `scroll`,
 * - se ferme au clic extérieur / Escape / événement global,
 * - est rendu dans `document.body` pour éviter le clipping.
 */
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

    /**
     * Diffère l’affichage au premier rendu client afin de garantir la disponibilité de `document`.
     */
    useEffect(() => setMounted(true), []);

    /**
     * Met à jour la position du popover lors des changements de viewport/scroll.
     */
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

    /**
     * Gère les mécanismes de fermeture :
     * - clic/touch extérieur,
     * - touche Escape,
     * - événement global {@link CLOSE_EVENT}.
     */
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
        document.body
    );
}

/* -------------------------------------------------------------------------- */
/*                              MAPPING TYPÉ API                              */
/* -------------------------------------------------------------------------- */

/**
 * DTO de définition de badge tel que renvoyé par l’API.
 */
type ApiBadgeDefinitionDto = {
    slug: string;
    titleKey: string;
    descriptionKey: string | null;
    iconKey: string | null;
};

/**
 * DTO d’un badge utilisateur tel que renvoyé par l’API.
 */
type ApiUserBadgeDto = {
    id: string;
    earnedAt: string;
    badge: ApiBadgeDefinitionDto;
};

/**
 * Convertit un DTO `ApiUserBadgeDto` en {@link BadgeToastItem}.
 *
 * @param raw - DTO brut issu de l’API.
 * @returns Élément prêt pour l’affichage (lotus + popover).
 */
function mapUserBadgeDtoToToastItem(raw: ApiUserBadgeDto): BadgeToastItem {
    return {
        id: raw.id,
        slug: raw.badge.slug,
        titleKey: raw.badge.titleKey,
        descriptionKey: raw.badge.descriptionKey ?? "",
        iconKey: raw.badge.iconKey,
        earnedAt: new Date(raw.earnedAt).toISOString(),
    };
}

/* -------------------------------------------------------------------------- */
/*                                OVERLAY FINAL                               */
/* -------------------------------------------------------------------------- */

/**
 * Overlay affichant les derniers badges sur la map sous forme de marqueurs “lotus”.
 *
 * @returns Overlay de badges, ou `null` si aucun badge n’est disponible.
 */
export function WorldBadgesLotusOverlay() {
    const tBadges = useTranslations("badges");

    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const { getPositionForIndex, markerSizeClass } = useLotusOverlayLayout();

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);

    const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    /**
     * Charge les badges et remet à zéro le popover courant afin d’éviter
     * de conserver une ancre DOM obsolète.
     */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setOpenId(null);

            const res = await apiFetch(`/badges/me?limit=${MAX_BADGES}`, {
                cache: "no-store",
            });

            if (!res.ok) return;

            const raw = (await res.json()) as ApiUserBadgeDto[];

            if (!Array.isArray(raw)) {
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

    function toggleOpen(badgeId: string) {
        setOpenId((prev) => (prev === badgeId ? null : badgeId));
    }

    function registerMarkerRef(badgeId: string, el: HTMLButtonElement | null) {
        markerRefs.current[badgeId] = el;
    }

    return (
        <LotusOverlayView
            badges={badges}
            openId={openId}
            getPositionForIndex={getPositionForIndex}
            markerSizeClass={markerSizeClass}
            onToggleOpen={toggleOpen}
            registerMarkerRef={registerMarkerRef}
            renderPopover={() =>
                openBadge && openAnchorRect ? (
                    <BadgePortalPopover
                        badge={openBadge}
                        t={tBadges}
                        anchorRect={openAnchorRect}
                        onRequestClose={() => setOpenId(null)}
                    />
                ) : null
            }
        />
    );
}
