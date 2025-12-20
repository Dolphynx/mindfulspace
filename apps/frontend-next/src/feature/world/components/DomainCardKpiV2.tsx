"use client";

import { DottedSparkline } from "@/feature/world/ui/DottedSparkline";

/**
 * Palette de tons supportée par la carte KPI.
 *
 * Utilisée pour dériver les classes Tailwind (rail, glow, CTA, etc.).
 */
type Tone = "blue" | "purple" | "green";

/**
 * Retourne les classes Tailwind associées à un ton visuel.
 *
 * Cette fonction centralise la “thématisation” de la carte (fond lumineux, rail latéral,
 * bouton principal, et styles de puces) afin d’éviter la duplication de classes.
 *
 * @param tone - Ton demandé pour la carte.
 * @returns Dictionnaire de classes Tailwind par rôle UI.
 */
function toneClasses(tone: Tone) {
    if (tone === "green") {
        return {
            /** Halo lumineux (glow) utilisé pour les blobs décoratifs. */
            glow: "bg-emerald-200/20",
            /** Rail latéral vertical décoratif. */
            rail: "bg-emerald-500/60",
            /** Bouton principal (CTA primaire). */
            primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
            /** Style de “chip” (prévu pour des badges/étiquettes). */
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
 * La logique est volontairement tolérante :
 * - Si aucun `:` n’est présent, la valeur est conservée telle quelle et le label est vide.
 * - Le `:` est conservé dans le label (ex. `"Sommeil :"`) afin de permettre un rendu
 *   conforme à la source textuelle.
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
 * Carte de domaine affichant deux KPIs, une micro-tendance (sparkline) et deux CTA.
 *
 * Composant **client-side** (Next.js) destiné à une UI “dashboard”/hub :
 * - Header : titre + sous-titre + label de période.
 * - Corps : deux KPIs + un encart récapitulatif avec sparkline.
 * - Actions : CTA primaire (ouvrir le domaine) + CTA secondaire (quick log).
 *
 * L’apparence est modulée via `tone` (thèmes Tailwind) et le graphe via `sparklineData`.
 */
export function DomainCardKpiV2(props: {
    /** Titre affiché dans l’en-tête de la carte. */
    title: string;
    /** Sous-titre (texte descriptif) affiché sous le titre. */
    subtitle: string;

    /**
     * KPI A (format texte), typiquement au format `"Label : value"`.
     * Exemple : `"Sommeil : 7h20"`.
     */
    kpiA: string;

    /**
     * KPI B (format texte), typiquement au format `"Label : value"`.
     * Exemple : `"Objectif : 5/7"`.
     */
    kpiB: string;

    /** Note de bas de bloc (texte secondaire) affichée dans l’encart du sparkline. */
    footnote: string;

    /** Libellé du bouton principal. */
    primaryCta: string;

    /** Libellé du bouton secondaire. */
    secondaryCta: string;

    /**
     * Handler du CTA principal.
     * Attendu : ouverture du panneau/drawer correspondant au domaine.
     */
    onOpen: () => void;

    /**
     * Handler du CTA secondaire.
     * Attendu : ouverture d’une action rapide (saisie / quick log).
     */
    onQuickLog: () => void;

    /**
     * Ton visuel de la carte (thème Tailwind).
     * Par défaut : `"blue"`.
     */
    tone?: Tone;

    /**
     * Données du sparkline.
     * Si non fourni, un jeu de valeurs par défaut est utilisé.
     */
    sparklineData?: number[];

    /**
     * Libellé de période affiché dans l’en-tête (ex. `"7 jours"`).
     * Par défaut : `"7 jours"`.
     */
    sparklineLabel?: string; // ex: "7 jours"
}) {
    /** Ton résolu avec valeur par défaut. */
    const tone: Tone = props.tone ?? "blue";
    /** Classes Tailwind dérivées du ton. */
    const s = toneClasses(tone);

    /** KPI A (label/valeur) prêt à afficher. */
    const kA = splitKpi(props.kpiA);
    /** KPI B (label/valeur) prêt à afficher. */
    const kB = splitKpi(props.kpiB);

    /**
     * Série du sparkline.
     * Valeur de secours utilisée en l’absence de données réelles.
     */
    const spark = props.sparklineData ?? [10, 12, 9, 14, 12, 13, 11];

    return (
        <section
            className={[
                "relative overflow-hidden rounded-[28px] bg-white/60 backdrop-blur-xl",
                "border border-white/40 shadow-[0_20px_60px_rgba(15,23,42,0.10)]",
                "p-5 transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] hover:-translate-y-[1px]",
            ].join(" ")}
        >
            {/* glow */}
            <div className={`pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />
            <div className={`pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />

            {/* rail */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${s.rail}`} />

            {/* header */}
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

            {/* KPI chips + sparkline */}
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

            {/* CTA */}
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={props.onOpen}
                    className={[
                        "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition",
                        s.primary,
                    ].join(" ")}
                >
                    {props.primaryCta}
                </button>

                <button
                    type="button"
                    onClick={props.onQuickLog}
                    className="rounded-2xl border border-white/50 bg-white/65 hover:bg-white/85 transition px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
                >
                    {props.secondaryCta}
                </button>
            </div>
        </section>
    );
}
