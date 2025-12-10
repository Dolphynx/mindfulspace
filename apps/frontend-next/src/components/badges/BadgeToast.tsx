"use client";

import type { BadgeToastItem } from "@/types/badges";

interface BadgeToastProps {
    badge: BadgeToastItem;
    onClose: () => void;
}

export function BadgeToast({ badge, onClose }: BadgeToastProps) {
    return (
        <button
            type="button"
            onClick={onClose}
            className="
                fixed
                bottom-6
                right-6
                z-50
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                shadow-xl
            "
        >
            {/* Icône du badge : vient de la DB via `iconKey` */}
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 shadow-sm overflow-hidden">
                {badge.iconKey ? (
                    <img
                        src={`/images/badges/${badge.iconKey}`}
                        alt=""
                        className="h-10 w-10 object-contain"
                    />
                ) : (
                    <span className="text-xl" aria-hidden="true">
                        🏅
                    </span>
                )}
            </div>

            {/* Texte */}
            <div className="text-left">
                <div className="text-sm font-semibold">
                    {badge.titleKey}
                </div>
                {badge.descriptionKey && (
                    <div className="text-xs text-gray-600">
                        {badge.descriptionKey}
                    </div>
                )}
            </div>
        </button>
    );
}
