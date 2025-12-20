// File: src/feature/world/views/overview/QuickLogLauncher.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";
import { useWorldHub } from "../../hub/WorldHubProvider";

/**
 * @file QuickLogLauncher.tsx
 * @description
 * Lanceur Quick Log par domaine (sélecteur d’icônes).
 *
 * Contrainte Next.js (App Router) :
 * - Les props doivent être sérialisables (TS71007).
 * - Les callbacks (ex: `onChange`) ne sont pas sérialisables.
 *
 * Stratégie :
 * - Remplacer le callback par une action directe via {@link useWorldHub}.
 * - Le composant déclenche l’ouverture du Quick Log au clic.
 */

/**
 * Propriétés du composant {@link QuickLogLauncher}.
 */
export type QuickLogLauncherProps = {
    /**
     * Domaine actuellement actif / sélectionné (pour le style `aria-pressed`).
     */
    active: Domain;
};

/**
 * Configuration statique des boutons Quick Log par domaine.
 */
const ITEMS: {
    key: Domain;
    labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt";
    iconSrc: string;
}[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Lanceur Quick Log par domaine.
 *
 * @param props - Propriétés du composant.
 * @returns Sélecteur de domaine ouvrant le Quick Log sur le domaine choisi.
 */
export function QuickLogLauncher({ active }: QuickLogLauncherProps) {
    const tWorld = useTranslations("publicWorld");
    const { openQuickLog } = useWorldHub();

    return (
        <div className="flex items-center justify-start gap-3">
            {ITEMS.map((it) => {
                const isActive = it.key === active;

                return (
                    <button
                        key={it.key}
                        type="button"
                        onClick={() => openQuickLog(it.key)}
                        aria-pressed={isActive}
                        title={tWorld(it.labelKey)}
                        className={[
                            "h-14 w-14 rounded-2xl border transition overflow-hidden",
                            "bg-white/60 backdrop-blur shadow-sm",
                            isActive
                                ? "border-slate-300 ring-2 ring-slate-200"
                                : "border-white/40 hover:bg-white/80",
                            "flex items-center justify-center",
                        ].join(" ")}
                    >
                        <div className="relative h-9 w-9">
                            <Image
                                src={it.iconSrc}
                                alt={tWorld(it.labelKey)}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
