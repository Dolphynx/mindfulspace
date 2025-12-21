"use client";

/**
 * @file WorldBadgesStrip.tsx
 * @description
 * Bandeau “World” affichant les derniers badges mis en avant (“highlighted”)
 * sous forme d’icônes XXL, avec un popover de détail rendu via React Portal.
 *
 * Responsabilités principales :
 * - Chargement des badges depuis l’API REST.
 * - Affichage d’un nombre limité de badges (MAX_BADGES).
 * - Gestion d’un popover de détail par badge (titre + description).
 * - Gestion des interactions utilisateur (clic, clic extérieur, touche Escape).
 * - Gestion des états de chargement et d’absence de données.
 *
 * Contraintes UI :
 * - Le popover est rendu dans `document.body` via `createPortal` afin d’éviter
 *   les problèmes de clipping liés aux stacking contexts et aux conteneurs
 *   avec `overflow-hidden`.
 * - La position du popover est recalculée dynamiquement lors des scrolls
 *   et redimensionnements de la fenêtre.
 */

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";

import { apiFetch } from "@/lib/api/client";
import type { BadgeToastItem } from "@/types/badges";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

/**
 * Nombre maximal de badges affichés dans le bandeau.
 */
const MAX_BADGES = 3;

/**
 * Supprime le namespace `badges.` d’une clé i18n si présent.
 *
 * Cette normalisation permet de consommer indifféremment :
 * - des clés absolues (`badges.xxx.yyy`)
 * - des clés relatives (`xxx.yyy`)
 *
 * @param key - Clé i18n potentiellement préfixée.
 * @returns Clé normalisée sans namespace, ou chaîne vide si invalide.
 */
function stripBadgesNamespace(key?: string | null) {
    if (!key) return "";
    return key.startsWith("badges.") ? key.slice("badges.".length) : key;
}

/**
 * Résout le titre traduit d’un badge.
 *
 * @param t - Fonction de traduction (scope `badges`).
 * @param badge - Badge concerné.
 * @returns Titre traduit ou chaîne vide.
 */
function getBadgeTitle(t: (k: string) => string, badge: BadgeToastItem) {
    const key = stripBadgesNamespace(badge.titleKey);
    if (!key) return "";
    return t(key);
}

/**
 * Résout la description traduite d’un badge.
 *
 * @param t - Fonction de traduction (scope `badges`).
 * @param badge - Badge concerné.
 * @returns Description traduite ou chaîne vide.
 */
function getBadgeDescription(t: (k: string) => string, badge: BadgeToastItem) {
    const key = stripBadgesNamespace(badge.descriptionKey);
    if (!key) return "";
    return t(key);
}

/**
 * Calcule la position absolue d’un popover ancré sous un bouton.
 *
 * Règles de positionnement :
 * - Centrage horizontal par rapport à l’ancre.
 * - Contraintes latérales pour rester dans le viewport.
 * - Décalage vertical fixe sous l’élément ancre.
 * - Prise en compte du scroll global.
 *
 * @param anchorRect - Rectangle DOM de l’élément ancre.
 * @returns Style positionnel prêt à être appliqué.
 */
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

/**
 * Popover de détail d’un badge.
 *
 * Implémentation :
 * - Rendu via React Portal (`document.body`).
 * - Positionnement dynamique basé sur l’ancre.
 * - Mise à jour automatique sur scroll et resize.
 *
 * @param badge - Badge à afficher.
 * @param t - Fonction de traduction (scope `badges`).
 * @param anchorRect - Rectangle DOM du bouton ancre.
 */
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

    /**
     * Assure un rendu strictement côté client.
     */
    useEffect(() => setMounted(true), []);

    /**
     * Synchronise la position du popover avec le viewport.
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
                    <Image
                        src={`/images/badges/${badge.iconKey ?? "default.png"}`}
                        alt=""
                        width={56}
                        height={56}
                        className="object-contain"
                    />
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 leading-snug">
                        {title}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 leading-snug">
                        {desc}
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/**
 * Bouton circulaire représentant un badge.
 *
 * Rôle :
 * - Sert d’ancre au popover.
 * - Gère l’état ouvert/fermé via un contrôle externe.
 *
 * @param badge - Badge associé.
 * @param t - Fonction de traduction.
 * @param isOpen - Indique si le popover est ouvert.
 * @param onToggle - Handler de bascule ouverture/fermeture.
 * @param buttonRef - Callback de référence DOM.
 */
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
            <Image
                src={`/images/badges/${badge.iconKey ?? "default.png"}`}
                alt=""
                width={96}
                height={96}
                className="object-contain p-3"
            />
        </button>
    );
}

/**
 * Bandeau principal affichant les badges récents.
 *
 * Intégré au contexte World Hub pour se synchroniser avec les rafraîchissements globaux.
 */
export function WorldBadgesStrip() {
    const tBadges = useTranslations("badges");
    const tWorld = useTranslations("world");

    const world = useWorldHubOptional();
    const refreshKey = world?.refreshKey ?? 0;

    const [badges, setBadges] = useState<BadgeToastItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    /**
     * Chargement des badges à chaque rafraîchissement du hub.
     */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setOpenId(null);
            setLoading(true);

            try {
                const res = await apiFetch(`/badges/me/highlighted?limit=${MAX_BADGES}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) return;

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

    /**
     * Fermeture du popover via la touche Escape.
     */
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpenId(null);
        }

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    /**
     * Fermeture du popover via clic extérieur.
     */
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

    const openBadge = useMemo(
        () => badges.find((b) => b.id === openId) ?? null,
        [badges, openId],
    );

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
                            onToggle={() =>
                                setOpenId((prev) => (prev === badge.id ? null : badge.id))
                            }
                            buttonRef={(el) => {
                                btnRefs.current[badge.id] = el;
                            }}
                        />
                    );
                })}
            </div>

            {openBadge && openAnchorRect ? (
                <BadgePortalPopover
                    badge={openBadge}
                    t={tBadges}
                    anchorRect={openAnchorRect}
                />
            ) : null}
        </div>
    );
}

/**
 * Squelette visuel affiché pendant le chargement des badges.
 */
function BadgeSkeleton() {
    return (
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/60 border border-white/60" />
    );
}
