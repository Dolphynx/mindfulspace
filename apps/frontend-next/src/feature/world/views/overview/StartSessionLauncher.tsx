"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";
import { useWorldHub } from "../../hub/WorldHubProvider";

/**
 * @file StartSessionLauncher.tsx
 * @description
 * Lanceur de démarrage de session par domaine.
 *
 * Contrainte Next.js :
 * - Pas de callbacks en props (TS71007).
 *
 * Stratégie :
 * - Déclencher l’action via {@link useWorldHub}.
 */

/**
 * Domaine autorisé pour le démarrage d’une session.
 *
 * Le domaine "sleep" est exclu : seules les sessions de méditation et d’exercice
 * peuvent être démarrées.
 */
export type StartDomain = Exclude<Domain, "sleep">;

/**
 * Propriétés du composant {@link StartSessionLauncher}.
 */
export type StartSessionLauncherProps = {
    /**
     * Domaine actuellement sélectionné (pour le style `aria-pressed`).
     */
    active: StartDomain;
};

/**
 * Configuration statique des domaines disponibles pour le démarrage de session.
 */
const ITEMS: {
    key: StartDomain;
    labelKey: "meditationAlt" | "exerciceAlt";
    iconSrc: string;
}[] = [
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Lanceur de démarrage de session par domaine.
 *
 * @param props - Propriétés du composant.
 * @returns Sélecteur de domaine ouvrant la vue “start session” sur le domaine choisi.
 */
export function StartSessionLauncher({ active }: StartSessionLauncherProps) {
    const tWorld = useTranslations("publicWorld");
    const { openStartSession } = useWorldHub();

    return (
        <div className="flex items-center justify-start gap-3">
            {ITEMS.map((it) => {
                const isActive = it.key === active;

                return (
                    <button
                        key={it.key}
                        type="button"
                        onClick={() => openStartSession(it.key)}
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
