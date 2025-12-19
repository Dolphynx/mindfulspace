// File: src/feature/world/views/overview/sections/DomainsSection.tsx

"use client";

/**
 * @file DomainsSection.tsx
 * @description
 * Overview domains section. Renders the three domain KPI cards (sleep, meditation, exercise).
 */

import type { Domain } from "@/feature/world/hub/types";
import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { DomainCardKpiV2 } from "@/feature/world/components/DomainCardKpiV2";
import { SkeletonCard } from "@/feature/world/views/overview/components/OverviewSkeletons";
import { ErrorCard } from "@/feature/world/views/overview/components/OverviewErrors";
import { formatHoursMinutes } from "@/feature/world/views/overview/utils/format";

type OverviewResult = ReturnType<typeof useWorldOverview>;

/**
 * Props for {@link DomainsSection}.
 */
export type DomainsSectionProps = {
    /**
     * Translation function for the "world" namespace.
     */
    t: (key: string) => string;

    /**
     * World overview hook result.
     */
    overview: OverviewResult;

    /**
     * Whether metrics are currently loading.
     */
    isLoading: boolean;

    /**
     * Whether metrics have been successfully loaded.
     */
    hasData: boolean;

    /**
     * Handler to open domain detail view.
     *
     * @param domain - Domain identifier.
     */
    onOpenDomainDetail: (domain: Domain) => void;

    /**
     * Handler to open Quick Log optionally pre-selected for a domain.
     *
     * @param domain - Optional domain identifier.
     */
    onOpenQuickLog: (domain?: Domain) => void;
};

/**
 * Domains section containing the three domain KPI cards.
 *
 * @param props - Component props.
 * @returns A section component.
 */
export function DomainsSection(props: DomainsSectionProps) {
    const { t, overview, isLoading, hasData, onOpenDomainDetail, onOpenQuickLog } = props;

    if (isLoading) {
        return (
            <section aria-label={t("sections.domainsAria")}>
                <div className="text-sm font-semibold text-slate-700">{t("sections.domainsTitle")}</div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </section>
        );
    }

    if (!hasData || overview.data == null) {
        return (
            <section aria-label={t("sections.domainsAria")}>
                <div className="text-sm font-semibold text-slate-700">{t("sections.domainsTitle")}</div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ErrorCard message={t("overview.metricsLoadError") ?? "Impossible de charger."} />
                    <ErrorCard message={t("overview.metricsLoadError") ?? "Impossible de charger."} />
                    <ErrorCard message={t("overview.metricsLoadError") ?? "Impossible de charger."} />
                </div>
            </section>
        );
    }

    const data = overview.data;

    return (
        <section aria-label={t("sections.domainsAria")}>
            <div className="text-sm font-semibold text-slate-700">{t("sections.domainsTitle")}</div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <DomainCardKpiV2
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
                            ? (t("overview.sleepFootnoteEmpty") ?? "Aucune nuit encodée cette semaine.")
                            : `${t("overview.sleepFootnoteLastNight") ?? "Dernière nuit :"} ${formatHoursMinutes(
                                data.sleep.lastNightMinutes,
                            )} ${
                                data.sleep.lastNightQuality == null ? "" : `• ${data.sleep.lastNightQuality}/5`
                            }`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    onOpen={() => onOpenDomainDetail("sleep")}
                    onQuickLog={() => onOpenQuickLog("sleep")}
                    sparklineData={[7, 8, 6, 9, 8, 7, 8]}
                />

                <DomainCardKpiV2
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
                            ? (t("overview.meditationFootnoteEmpty") ?? "Aucune humeur enregistrée.")
                            : `${t("overview.meditationFootnoteMood") ?? "Humeur moyenne :"} ${
                                data.meditation.avgMoodAfter
                            }/5`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    onOpen={() => onOpenDomainDetail("meditation")}
                    onQuickLog={() => onOpenQuickLog("meditation")}
                    sparklineData={[0, 10, 0, 15, 5, 0, 12]}
                />

                <DomainCardKpiV2
                    tone="green"
                    title={t("domains.exercise")}
                    subtitle={t("overview.exerciseMainKpi") ?? "Cette semaine"}
                    kpiA={`${t("overview.exerciseKpiA") ?? "Séances :"} ${data.exercise.weekSessions}`}
                    kpiB={`${t("overview.exerciseKpiB") ?? "Objectifs :"} ${
                        data.exercise.weekDistinctExercises
                    }`}
                    footnote={
                        data.exercise.avgQuality == null
                            ? (t("overview.exerciseFootnoteEmpty") ?? "Aucune qualité encodée.")
                            : `${t("overview.exerciseFootnoteQuality") ?? "Qualité moyenne :"} ${
                                data.exercise.avgQuality
                            }/5`
                    }
                    primaryCta={t("overview.viewDetail")}
                    secondaryCta={t("overview.encode")}
                    onOpen={() => onOpenDomainDetail("exercise")}
                    onQuickLog={() => onOpenQuickLog("exercise")}
                    sparklineData={[0, 0, 10, 0, 20, 15, 0]}
                />
            </div>
        </section>
    );
}
