"use client";

/**
 * @file ActionTile.tsx
 * @description
 * Tuile d’action compacte utilisée dans le World Hub.
 *
 * Objectifs :
 * - Présenter une action claire (titre + sous-titre).
 * - Mettre en avant un CTA unique.
 * - Offrir une hiérarchie visuelle cohérente via un rail et un glow décoratif.
 *
 * Contrainte Next (App Router) :
 * Les props d’un Client Component pouvant être rendu depuis un Server Component
 * doivent être sérialisables. Les fonctions (ex: `onClick`) ne le sont pas.
 *
 * Ce composant évite donc les callbacks en props et expose une clé d’action
 * sérialisable {@link ActionTileAction}. L’exécution est déléguée au hub côté client.
 */

import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

/**
 * Tons visuels supportés par {@link ActionTile}.
 */
export type Tone = "blue" | "purple" | "green";

/**
 * Actions supportées par {@link ActionTile}.
 *
 * Cette valeur est sérialisable et permet d’éviter le passage de fonctions
 * (non sérialisables) via les props, ce qui prévient l’erreur TS71007.
 */
export type ActionTileAction = "quickLog" | "startSession" | "programs";

/**
 * Mapping des styles Tailwind par ton.
 */
const toneStyles: Record<Tone, { rail: string; glow: string; cta: string }> = {
    blue: {
        rail: "bg-blue-500/70",
        glow: "bg-blue-200/25",
        cta: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    purple: {
        rail: "bg-violet-500/70",
        glow: "bg-violet-200/25",
        cta: "bg-violet-600 hover:bg-violet-700 text-white",
    },
    green: {
        rail: "bg-emerald-500/70",
        glow: "bg-emerald-200/25",
        cta: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
};

/**
 * Propriétés de {@link ActionTile}.
 */
export type ActionTileProps = {
    /** Titre principal de l’action. */
    title: string;

    /** Sous-titre descriptif de l’action. */
    subtitle: string;

    /** Libellé du bouton d’action (CTA). */
    ctaLabel: string;

    /**
     * Clé d’action sérialisable.
     *
     * L’action est exécutée côté client via le World Hub.
     */
    action: ActionTileAction;

    /**
     * Ton visuel de la tuile.
     *
     * @defaultValue `"blue"`
     */
    tone?: Tone;
};

/**
 * Tuile d’action compacte (titre + sous-titre + CTA).
 *
 * @param props - Propriétés du composant.
 * @returns Tuile d’action stylée.
 */
export function ActionTile({
                               title,
                               subtitle,
                               ctaLabel,
                               action,
                               tone = "blue",
                           }: ActionTileProps) {
    const s = toneStyles[tone];

    const { openQuickLog, openStartSession, openPrograms } = useWorldHub();

    /**
     * Exécute l’action correspondante côté client.
     *
     * Remarque : les handlers du hub peuvent avoir une signature plus large que `() => void`.
     * L’appel est encapsulé pour garantir une compatibilité avec `onClick`.
     */
    function handleActionClick() {
        switch (action) {
            case "quickLog":
                openQuickLog();
                break;
            case "startSession":
                openStartSession();
                break;
            case "programs":
                openPrograms();
                break;
            default: {
                // Exhaustivité TypeScript
                const _exhaustive: never = action;
                return _exhaustive;
            }
        }
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/65 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]">
            {/* Halo décoratif non interactif */}
            <div
                className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl ${s.glow}`}
            />

            {/* Rail latéral indicateur de ton */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${s.rail}`} />

            <div className="flex items-center justify-between gap-4 p-4 pl-5">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                        {title}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
                </div>

                <button
                    type="button"
                    onClick={handleActionClick}
                    className={[
                        "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition",
                        s.cta,
                        "focus:outline-none focus:ring-2 focus:ring-black/10",
                    ].join(" ")}
                >
                    {ctaLabel}
                </button>
            </div>
        </div>
    );
}
