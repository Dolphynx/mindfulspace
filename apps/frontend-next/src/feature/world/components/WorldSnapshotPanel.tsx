"use client";

import { DottedSparkline } from "@/feature/world/ui/DottedSparkline";
import { StatChip } from "@/feature/world/ui/StatChip";
import { SoftProgress } from "@/feature/world/ui/SoftProgress";

/**
 * Propriétés du panneau “snapshot” affiché dans le hub World.
 *
 * Ce panneau est conçu pour agréger quelques indicateurs clés (minutes sur la semaine,
 * score de bien-être, streak) ainsi qu’un aperçu de tendance (sparkline) et une barre
 * de progression (SoftProgress).
 */
type Props = {
    /** Titre du panneau. */
    title: string;

    /** Libellé du KPI “minutes semaine”. */
    weekMinutesLabel: string;

    /** Libellé du KPI “bien-être”. */
    wellbeingLabel: string;

    /** Libellé du KPI “streak” (consécutif). */
    streakLabel: string;

    /** Valeur numérique des minutes cumulées sur la semaine. */
    weekMinutes: number;

    /** Score de bien-être (attendu sur 100). */
    wellbeingScore: number;

    /** Nombre de jours consécutifs (streak) pour la méditation. */
    meditationStreakDays: number;

    /**
     * Série de données de tendance (sparkline).
     * Si non fournie, un jeu de valeurs par défaut est utilisé.
     */
    trendData?: number[];

    /** Titre de section pour la zone de tendance (ex. “Tendance”). */
    trendTitle: string;

    /** Libellé de période associé à la tendance (ex. “7 derniers jours”). */
    last7DaysLabel: string;

    /** Libellé affiché à gauche de la barre de bien-être (ex. “Bien-être”). */
    wellbeingBarLabel: string;

    /** Libellé de statut si le score est jugé faible (ex. “À améliorer”). */
    statusImproveLabel: string;

    /** Libellé de statut si le score est jugé acceptable (ex. “Stable”). */
    statusStableLabel: string;
};

/**
 * Panneau “World Snapshot” affichant un résumé synthétique des indicateurs.
 *
 * Structure UI :
 * - Titre du panneau.
 * - Trois indicateurs sous forme de chips (StatChip).
 * - Un bloc de détails regroupant :
 *   - une tendance sur la période (DottedSparkline),
 *   - une barre de progression du score de bien-être (SoftProgress).
 *
 * Règles de rendu :
 * - La tendance utilise `props.trendData` si disponible, sinon une série de secours.
 * - Le libellé d’état de la barre de bien-être dépend d’un seuil (50).
 *
 * @param props - Propriétés typées du panneau.
 * @returns Élément React prêt à être rendu dans le hub World.
 */
export function WorldSnapshotPanel(props: Props) {
    /**
     * Série de tendance utilisée par le sparkline.
     * Valeur de secours appliquée si `trendData` n’est pas fournie.
     */
    const trend = props.trendData ?? [32, 35, 30, 40, 45, 42, 40];

    /**
     * Libellé de statut dérivé du score de bien-être.
     * Seuil : inférieur à 50 => “à améliorer”, sinon “stable”.
     */
    const wellbeingStatus =
        props.wellbeingScore < 50 ? props.statusImproveLabel : props.statusStableLabel;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/60 border border-white/40 p-4">
            {/* Halos décoratifs non interactifs (glows). */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-14 h-52 w-52 rounded-full bg-violet-200/20 blur-3xl" />

            <div className="text-sm font-semibold text-slate-800">{props.title}</div>

            {/* Indicateurs clés sous forme de chips. */}
            <div className="mt-3 flex flex-wrap gap-2">
                <StatChip label={props.weekMinutesLabel} value={`${props.weekMinutes} min`} />
                <StatChip label={props.wellbeingLabel} value={`${props.wellbeingScore}/100`} />
                <StatChip label={props.streakLabel} value={`${props.meditationStreakDays}`} />
            </div>

            {/* Bloc tendance + barre de progression bien-être. */}
            <div className="mt-4 rounded-2xl border border-white/40 bg-white/55 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {props.trendTitle}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">{props.last7DaysLabel}</div>
                    </div>

                    <div className="w-48">
                        <DottedSparkline data={trend} tone="blue" />
                    </div>
                </div>

                <div className="mt-4">
                    <SoftProgress
                        value={props.wellbeingScore}
                        tone="purple"
                        labelLeft={props.wellbeingBarLabel}
                        labelRight={wellbeingStatus}
                    />
                </div>
            </div>
        </div>
    );
}
