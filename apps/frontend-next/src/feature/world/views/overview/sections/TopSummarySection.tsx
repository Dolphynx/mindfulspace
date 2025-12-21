"use client";

/**
 * @file TopSummarySection.tsx
 * @description
 * Section de synthèse en haut de l’overview du World Hub.
 *
 * Cette section affiche :
 * - à gauche : le panneau “snapshot” (KPIs transverses),
 * - à droite : les derniers badges mis en avant.
 *
 * Gestion d’état :
 * - `isLoading` : skeletons afin de préserver le layout.
 * - absence de données (`!hasData` ou `overview.data == null`) :
 *   - panneau d’erreur côté snapshot,
 *   - bloc badges toujours rendu (liste potentiellement vide gérée par `WorldBadgesStrip`).
 *
 * Contrainte Next.js (App Router) :
 * - Les props d’un Client Component pouvant être importé/rendu côté serveur doivent être sérialisables.
 * - Les fonctions (ex: `t`, handlers) ne le sont pas et déclenchent TS71007.
 *
 * Stratégie :
 * - La traduction est obtenue via {@link useTranslations}.
 * - Les actions de navigation sont obtenues via {@link useWorldHub}.
 */

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

import { WorldBadgesStrip } from "@/feature/world/components/WorldBadgesStrip";
import { WorldSnapshotPanel } from "@/feature/world/components/WorldSnapshotPanel";
import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { CardShell } from "@/feature/world/views/shared/CardShell";
import { SkeletonPanel } from "@/feature/world/views/overview/components/OverviewSkeletons";
import { ErrorPanel } from "@/feature/world/views/overview/components/OverviewErrors";

/**
 * Type utilitaire : résultat du hook `useWorldOverview`.
 */
type OverviewResult = ReturnType<typeof useWorldOverview>;

/**
 * Propriétés du composant {@link TopSummarySection}.
 *
 * Remarque : aucune fonction n’est acceptée en props (évite TS71007).
 */
export type TopSummarySectionProps = {
    /** Résultat du hook d’overview (contient état + données éventuelles). */
    overview: OverviewResult;

    /** Indique si les métriques sont en cours de chargement. */
    isLoading: boolean;

    /** Indique si des données valides sont disponibles (contrat de la vue parente). */
    hasData: boolean;
};

/**
 * Section de synthèse (snapshot + badges récents).
 *
 * Structure :
 * - Enveloppe {@link CardShell}.
 * - Grille responsive en 2 colonnes à partir de `lg`.
 *
 * @param props - Propriétés du composant.
 * @returns Section de synthèse supérieure.
 */
export function TopSummarySection(props: TopSummarySectionProps) {
    const { overview, isLoading, hasData } = props;

    const t = useTranslations("world");
    const { openBadges } = useWorldHub();

    if (isLoading) {
        return (
            <CardShell
                title={t("overview.snapshotTitle")}
                subtitle={t("overview.topSummaryAria") ?? undefined}
                className="relative"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SkeletonPanel />

                    <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                        <div className="h-4 w-24 rounded bg-white/70" />
                        <div className="mt-3 h-10 rounded-2xl bg-white/60 border border-white/40" />
                    </div>
                </div>
            </CardShell>
        );
    }

    if (!hasData || overview.data == null) {
        return (
            <CardShell
                title={t("overview.snapshotTitle")}
                subtitle={t("overview.topSummaryAria") ?? undefined}
                className="relative"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ErrorPanel
                        title={t("overview.snapshotTitle")}
                        message={
                            t("overview.metricsLoadError") ??
                            "Impossible de charger les métriques."
                        }
                    />

                    <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-800">
                                {t("overview.recentBadgesTitle")}
                            </div>

                            <button
                                type="button"
                                onClick={() => openBadges()}
                                className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                            >
                                {t("overview.viewAll")}
                            </button>
                        </div>

                        <div className="mt-3">
                            <WorldBadgesStrip />
                        </div>
                    </div>
                </div>
            </CardShell>
        );
    }

    const data = overview.data;

    return (
        <CardShell
            title={t("overview.snapshotTitle")}
            subtitle={t("overview.topSummaryAria") ?? undefined}
            className="relative"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <WorldSnapshotPanel
                    title={t("overview.snapshotTitle")}
                    weekMinutesLabel={t("overview.chipWeekMinutes")}
                    wellbeingLabel={t("overview.chipWellbeing")}
                    streakLabel={t("overview.chipStreak") ?? "Streak"}
                    weekMinutes={data.snapshot.weekMinutes}
                    wellbeingScore={data.snapshot.wellbeingScore}
                    meditationStreakDays={data.snapshot.meditationStreakDays}
                    trendData={[32, 35, 30, 40, 45, 42, 40]}
                    trendTitle={t("overview.trendTitle")}
                    last7DaysLabel={t("overview.last7Days")}
                    wellbeingBarLabel={t("overview.wellbeingBarLabel")}
                    statusImproveLabel={t("overview.statusImprove")}
                    statusStableLabel={t("overview.statusStable")}
                />

                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">
                            {t("overview.recentBadgesTitle")}
                        </div>

                        <button
                            type="button"
                            onClick={() => openBadges()}
                            className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                        >
                            {t("overview.viewAll")}
                        </button>
                    </div>

                    <div className="mt-3">
                        <WorldBadgesStrip />
                    </div>
                </div>
            </div>
        </CardShell>
    );
}
