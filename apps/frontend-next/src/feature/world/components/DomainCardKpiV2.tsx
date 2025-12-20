"use client";

import { DottedSparkline } from "@/feature/world/ui/DottedSparkline";
import type { Domain } from "@/feature/world/hub/types";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

/**
 * @file DomainCardKpiV2.tsx
 * @description
 * Carte de domaine affichant deux KPIs, une micro-tendance (sparkline) et deux CTA.
 *
 * Contrainte Next.js (App Router) :
 * - Les props d’un Client Component pouvant être importé/rendu côté serveur doivent être sérialisables.
 * - Les fonctions (callbacks) ne sont pas sérialisables et déclenchent TS71007.
 *
 * Stratégie :
 * - Exposer uniquement des props sérialisables (dont `domain`, `primaryAction`, `secondaryAction`).
 * - Déclencher les actions côté client via {@link useWorldHub}.
 */

/**
 * Palette de tons supportée par la carte KPI.
 *
 * Utilisée pour dériver les classes Tailwind (rail, glow, CTA, etc.).
 */
export type Tone = "blue" | "purple" | "green";

/**
 * Actions supportées par {@link DomainCardKpiV2}.
 *
 * Valeurs sérialisables (évite TS71007).
 */
export type DomainCardAction = "openDomainDetail" | "openQuickLog";

/**
 * Retourne les classes Tailwind associées à un ton visuel.
 *
 * @param tone - Ton demandé pour la carte.
 * @returns Dictionnaire de classes Tailwind par rôle UI.
 */
function toneClasses(tone: Tone) {
    if (tone === "green") {
        return {
            glow: "bg-emerald-200/20",
            rail: "bg-emerald-500/60",
            primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
            chip: "bg-emerald-50/60 border-emerald-100 text-emerald-900",
        };
    }
    if (tone === "purple") {
        return {
            glow: "bg-violet-200/20",
            rail: "bg-violet-500/60",
            primary: "bg-violet-600 hover:bg-violet-700 text-white",
            chip: "bg-violet-50/60 border-violet-100 text-violet-900",
        };
    }
    return {
        glow: "bg-blue-200/20",
        rail: "bg-blue-500/60",
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        chip: "bg-blue-50/60 border-blue-100 text-blue-900",
    };
}

/**
 * Découpe une chaîne de KPI attendue au format `"Label : value"`.
 *
 * @param text - Texte du KPI (ex. `"Sommeil : 7h20"`).
 * @returns Objet `{ label, value }` prêt à être affiché.
 */
function splitKpi(text: string) {
    const idx = text.indexOf(":");
    if (idx === -1) return { label: "", value: text.trim() };
    return {
        label: text.slice(0, idx + 1).trim(),
        value: text.slice(idx + 1).trim(),
    };
}

/**
 * Propriétés de {@link DomainCardKpiV2}.
 *
 * Remarque : aucune fonction n’est acceptée en props (évite TS71007).
 */
export type DomainCardKpiV2Props = {
    /** Domaine rattaché à la carte. */
    domain: Domain;

    /** Titre affiché dans l’en-tête de la carte. */
    title: string;

    /** Sous-titre (texte descriptif) affiché sous le titre. */
    subtitle: string;

    /** KPI A (format texte), typiquement `"Label : value"`. */
    kpiA: string;

    /** KPI B (format texte), typiquement `"Label : value"`. */
    kpiB: string;

    /** Note secondaire affichée dans l’encart sparkline. */
    footnote: string;

    /** Libellé du bouton principal. */
    primaryCta: string;

    /** Libellé du bouton secondaire. */
    secondaryCta: string;

    /**
     * Action déclenchée par le CTA principal.
     *
     * @defaultValue `"openDomainDetail"`
     */
    primaryAction?: DomainCardAction;

    /**
     * Action déclenchée par le CTA secondaire.
     *
     * @defaultValue `"openQuickLog"`
     */
    secondaryAction?: DomainCardAction;

    /**
     * Ton visuel de la carte (thème Tailwind).
     *
     * @defaultValue `"blue"`
     */
    tone?: Tone;

    /**
     * Données du sparkline.
     * Si non fourni, un jeu de valeurs par défaut est utilisé.
     */
    sparklineData?: number[];

    /**
     * Libellé de période affiché dans l’en-tête (ex. `"7 jours"`).
     *
     * @defaultValue `"7 jours"`
     */
    sparklineLabel?: string;
};

/**
 * Carte KPI de domaine (2 KPIs + sparkline + 2 CTA).
 *
 * @param props - Propriétés de la carte.
 * @returns Carte KPI.
 */
export function DomainCardKpiV2(props: DomainCardKpiV2Props) {
    const tone: Tone = props.tone ?? "blue";
    const s = toneClasses(tone);

    const kA = splitKpi(props.kpiA);
    const kB = splitKpi(props.kpiB);

    const spark = props.sparklineData ?? [10, 12, 9, 14, 12, 13, 11];

    const primaryAction: DomainCardAction = props.primaryAction ?? "openDomainDetail";
    const secondaryAction: DomainCardAction = props.secondaryAction ?? "openQuickLog";

    const { openDomainDetail, openQuickLog } = useWorldHub();

    /**
     * Exécute une action de carte à partir d’une clé sérialisable.
     *
     * @param action - Action à déclencher.
     */
    function runAction(action: DomainCardAction) {
        switch (action) {
            case "openDomainDetail":
                openDomainDetail(props.domain);
                break;
            case "openQuickLog":
                openQuickLog(props.domain);
                break;
            default: {
                const _exhaustive: never = action;
                return _exhaustive;
            }
        }
    }

    return (
        <section
            className={[
                "relative overflow-hidden rounded-[28px] bg-white/60 backdrop-blur-xl",
                "border border-white/40 shadow-[0_20px_60px_rgba(15,23,42,0.10)]",
                "p-5 transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] hover:-translate-y-[1px]",
            ].join(" ")}
        >
            <div className={`pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />
            <div className={`pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />

            <div className={`absolute left-0 top-0 h-full w-1.5 ${s.rail}`} />

            <header className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {props.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{props.subtitle}</p>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {props.sparklineLabel ?? "7 jours"}
                </div>
            </header>

            <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-600">{kA.label}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{kA.value}</div>
                    </div>

                    <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-600">{kB.label}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{kB.value}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                {props.subtitle}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">{props.footnote}</div>
                        </div>

                        <div className="w-44 shrink-0">
                            <DottedSparkline data={spark} tone={tone} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => runAction(primaryAction)}
                    className={[
                        "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition",
                        s.primary,
                    ].join(" ")}
                >
                    {props.primaryCta}
                </button>

                <button
                    type="button"
                    onClick={() => runAction(secondaryAction)}
                    className="rounded-2xl border border-white/50 bg-white/65 hover:bg-white/85 transition px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
                >
                    {props.secondaryCta}
                </button>
            </div>
        </section>
    );
}
