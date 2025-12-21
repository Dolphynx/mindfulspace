"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { BadgeToastItem } from "@/types/badges";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Props attendues par le composant BadgeToast.
 */
interface BadgeToastProps {
    /**
     * Badge à afficher dans le toast.
     */
    badge: BadgeToastItem;

    /**
     * Callback déclenché lorsque le toast est fermé (automatiquement ou manuellement).
     */
    onClose: () => void;
}

/**
 * Composant visuel représentant une notification toast pour un badge gagné.
 *
 * Fonctionnement :
 * - Affiche une carte flottante en bas de l’écran.
 * - Affiche l’icône, le titre et, si disponible, une description du badge.
 * - Se ferme automatiquement après un délai.
 * - Permet également la fermeture manuelle.
 *
 * Ce composant est destiné à être utilisé via le `BadgeToastProvider`,
 * plutôt que directement par l’application.
 */
export function BadgeToast({ badge, onClose }: BadgeToastProps) {
    const AUTO_CLOSE_DELAY = 4000; // 4 secondes
    const t = useTranslations("badges");

    /**
     * Déclenche une fermeture automatique après un délai prédéfini.
     * Le cleanup empêche un appel multiple si le composant est démonté.
     */
    useEffect(() => {
        const timer = setTimeout(onClose, AUTO_CLOSE_DELAY);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Nettoyage du namespace i18n (ex. "badges.zen10.title" → "zen10.title")
    const titleKey =
        badge.titleKey?.startsWith("badges.")
            ? badge.titleKey.slice("badges.".length)
            : badge.titleKey;

    const descriptionKey =
        badge.descriptionKey?.startsWith("badges.")
            ? badge.descriptionKey.slice("badges.".length)
            : badge.descriptionKey;

    return (
        <div
            className="
                fixed
                bottom-6
                left-1/2
                -translate-x-1/2
                z-50
                rounded-2xl
                bg-white
                shadow-xl
                p-4
                border border-slate-200
                flex
                items-center
                gap-4
                animate-fade-in-up
            "
        >
            {/* Icône du badge */}
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <Image
                    src={`/images/badges/${badge.iconKey ?? "default"}`}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 object-contain"
                />
            </div>

            {/* Texte du badge */}
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                    {/* Même logique que dans le strip : on tente la traduction du titleKey nettoyé,
                       sinon on tombe en fallback sur la clé brute. */}
                    {titleKey ? t(titleKey) : badge.titleKey}
                </span>

                {descriptionKey && (
                    <span className="text-xs text-slate-500 leading-tight mt-0.5">
                        {t(descriptionKey)}
                    </span>
                )}
            </div>

            {/* Bouton de fermeture */}
            <button
                onClick={onClose}
                className="
                    ml-2
                    text-slate-400
                    hover:text-slate-600
                    transition
                "
                aria-label="Close badge toast"
            >
                ✕
            </button>
        </div>
    );
}
