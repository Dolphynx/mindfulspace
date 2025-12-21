/**
 * @file LotusOverlayView.tsx
 * @description
 * Vue “pure” de l’overlay lotus :
 * - pas de fetch
 * - pas d’effets
 * - pas d’accès à window/document
 *
 * Tout est reçu par props.
 */

import Image from "next/image";
import type { BadgeToastItem } from "@/types/badges";

type Position = { xPct: number; yPct: number };

type Props = {
    badges: BadgeToastItem[];
    openId: string | null;

    getPositionForIndex: (i: number) => Position;
    markerSizeClass: string;

    onToggleOpen: (badgeId: string) => void;
    registerMarkerRef: (badgeId: string, el: HTMLButtonElement | null) => void;

    /**
     * Rendu du popover délégué au parent (qui gère portal + listeners).
     */
    renderPopover: () => React.ReactNode;
};

/**
 * Marker lotus cliquable (pure UI).
 */
function LotusBadgeMarker({
                              badge,
                              className,
                              onClick,
                              buttonRef,
                          }: {
    badge: BadgeToastItem;
    className: string;
    onClick: () => void;
    buttonRef: (el: HTMLButtonElement | null) => void;
}) {
    const badgeSrc = `/images/badges/${badge.iconKey ?? "default"}`;

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            className={`relative transition hover:scale-[1.03] focus:outline-none ${className}`}
            aria-label="badge"
        >
            <div className="absolute inset-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.16)]">
                <Image
                    src="/images/badges/badge-lotus-bg.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 80px, (min-width: 640px) 76px, 64px"
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[55%] h-[55%]">
                    <Image src={badgeSrc} alt="" fill className="object-contain drop-shadow-sm" />
                </div>
            </div>
        </button>
    );
}

export function LotusOverlayView({
                                     badges,
                                     openId,
                                     getPositionForIndex,
                                     markerSizeClass,
                                     onToggleOpen,
                                     registerMarkerRef,
                                     renderPopover,
                                 }: Props) {
    if (badges.length === 0) return null;

    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            {badges.map((badge, i) => {
                const pos = getPositionForIndex(i);

                return (
                    <div
                        key={badge.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
                    >
                        <LotusBadgeMarker
                            badge={badge}
                            className={markerSizeClass}
                            onClick={() => onToggleOpen(badge.id)}
                            buttonRef={(el) => registerMarkerRef(badge.id, el)}
                        />
                    </div>
                );
            })}

            {/* Le parent décide si un popover doit être rendu ou non */}
            {openId ? renderPopover() : null}
        </div>
    );
}
