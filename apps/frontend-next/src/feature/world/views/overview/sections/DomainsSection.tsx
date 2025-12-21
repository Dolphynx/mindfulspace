"use client";

/**
 * @file DomainsSection.tsx
 * @description
 * Section “Domaines” de l’overview du World Hub.
 *
 * Responsabilités :
 * - Afficher les trois cartes KPI des domaines (sleep, meditation, exercise).
 * - Gérer les états d’UI liés au chargement :
 *   - skeletons pendant `isLoading`,
 *   - cartes d’erreur si les données ne sont pas disponibles,
 *   - rendu des KPI à partir des données en cas de succès.
 *
 * Contrainte Next.js (App Router) :
 * - Les fonctions en props passées à des Client Components importables côté serveur
 *   déclenchent TS71007 (props non sérialisables).
 *
 * Stratégie :
 * - La traduction est obtenue via {@link useTranslations}.
 * - Les cartes reçoivent uniquement des props sérialisables.
 */

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { DomainCardKpiV2 } from "@/feature/world/components/DomainCardKpiV2";
import { SkeletonCard } from "@/feature/world/views/overview/components/OverviewSkeletons";
import { ErrorCard } from "@/feature/world/views/overview/components/OverviewErrors";
import { formatHoursMinutes } from "@/feature/world/views/overview/utils/format";

/**
 * Type utilitaire : résultat du hook `useWorldOverview`.
 */
type OverviewResult = ReturnType<typeof useWorldOverview>;

/**
 * Propriétés du composant {@link DomainsSection}.
 *
 * Remarque : aucune fonction n’est acceptée en props (évite TS71007).
 */
export type DomainsSectionProps = {
    /** Résultat du hook d’overview (contient état + données éventuelles). */
    overview: OverviewResult;

    /** Indique si les métriques sont en cours de chargement. */
    isLoading: boolean;

    /** Indique si des données valides sont disponibles. */
    hasData: boolean;
};

/**
 * Section affichant les trois cartes KPI de domaine.
 *
 * @param props - Propriétés du composant.
 * @returns Section “Domaines”.
 */
export function DomainsSection(props: DomainsSectionProps) {
    const { overview, isLoading, hasData } = props;
    const t = useTranslations("world");

    if (isLoading) {
        return (
            <section aria-label={t("sections.domainsAria")}>
                <div className="text-sm font-semibold text-slate-700">
                    {t("sections.domainsTitle")}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </section>
        );
    }

    if (!hasData || overview.data == null) {
        const msg = t("overview.metricsLoadError") ?? "Impossible de charger.";
        return (
            <section aria-label={t("sections.domainsAria")}>
                <div className="text-sm font-semibold text-slate-700">
                    {t("sections.domainsTitle")}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ErrorCard message={msg} />
                    <ErrorCard message={msg} />
                    <ErrorCard message={msg} />
                </div>
            </section>
        );
    }

    const data = overview.data;

    return (
        <section aria-label={t("sections.domainsAria")}>
            <div className="text-sm font-semibold text-slate-700">
                {t("sections.domainsTitle")}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <DomainCardKpiV2
                    domain="sleep"
                    tone="blue"
                    title={t("domains.sleep")}
                    subtitle={t("overview.sleepMainKpi") ?? "Durée moyenne"}
                    kpiA={`${t("overview.sleepKpiA") ?? "Durée :"} ${formatHoursMinutes(
                        data.sleep.avgDurationMinutes,
                    )}`}
                    kpiB={`${t("overview.sleepKpiB") ?? "Qualité :"} ${
                        data.sleep.avgQuality == null ? "—" : `${data.sleep.avgQuality}/5`
                    }`}
                    footnote={
                        data.sleep.lastNightMinutes == null
                            ? (t("overview.sleepFootnoteEmpty") ??
                                "Aucune nuit encodée cette semaine.")
                            : `${t("overview.sleepFootnoteLastNight") ?? "Dernière nuit :"} ${formatHoursMinutes(
                                data.sleep.lastNightMinutes,
                            )} ${
                                data.sleep.lastNightQuality == null
                                    ? ""
                                    : `• ${data.sleep.lastNightQuality}/5`
                            }`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    primaryAction="openDomainDetail"
                    secondaryAction="openQuickLog"
                    sparklineData={[7, 8, 6, 9, 8, 7, 8]}
                />

                <DomainCardKpiV2
                    domain="meditation"
                    tone="purple"
                    title={t("domains.meditation")}
                    subtitle={t("overview.meditationMainKpi") ?? "7 derniers jours"}
                    kpiA={`${t("overview.meditationKpiA") ?? "Séances :"} ${
                        data.meditation.last7DaysSessions
                    }`}
                    kpiB={`${t("overview.meditationKpiB") ?? "Minutes :"} ${
                        data.meditation.last7DaysMinutes
                    }`}
                    footnote={
                        data.meditation.avgMoodAfter == null
                            ? (t("overview.meditationFootnoteEmpty") ??
                                "Aucune humeur enregistrée.")
                            : `${t("overview.meditationFootnoteMood") ?? "Humeur moyenne :"} ${
                                data.meditation.avgMoodAfter
                            }/5`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    primaryAction="openDomainDetail"
                    secondaryAction="openQuickLog"
                    sparklineData={[0, 10, 0, 15, 5, 0, 12]}
                />

                <DomainCardKpiV2
                    domain="exercise"
                    tone="green"
                    title={t("domains.exercise")}
                    subtitle={t("overview.exerciseMainKpi") ?? "Cette semaine"}
                    kpiA={`${t("overview.exerciseKpiA") ?? "Séances :"} ${data.exercise.weekSessions}`}
                    kpiB={`${t("overview.exerciseKpiB") ?? "Objectifs :"} ${
                        data.exercise.weekDistinctExercises
                    }`}
                    footnote={
                        data.exercise.avgQuality == null
                            ? (t("overview.exerciseFootnoteEmpty") ??
                                "Aucune qualité encodée.")
                            : `${t("overview.exerciseFootnoteQuality") ?? "Qualité moyenne :"} ${
                                data.exercise.avgQuality
                            }/5`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    primaryAction="openDomainDetail"
                    secondaryAction="openQuickLog"
                    sparklineData={[0, 0, 10, 0, 20, 15, 0]}
                />
            </div>
        </section>
    );
}
