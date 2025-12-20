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
 *   - rendu des KPI à partir du DTO en cas de succès.
 *
 * Le composant reste volontairement “présentation + branchements” :
 * - il ne déclenche pas le chargement (reçu via `overview`),
 * - il délègue la navigation aux callbacks fournis.
 */

import type { Domain } from "@/feature/world/hub/types";
import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { DomainCardKpiV2 } from "@/feature/world/components/DomainCardKpiV2";
import { SkeletonCard } from "@/feature/world/views/overview/components/OverviewSkeletons";
import { ErrorCard } from "@/feature/world/views/overview/components/OverviewErrors";
import { formatHoursMinutes } from "@/feature/world/views/overview/utils/format";

/**
 * Type utilitaire : résultat du hook `useWorldOverview`.
 *
 * Cette forme permet de typer `overview` sans ré-exporter explicitement
 * un type dédié depuis le hook.
 */
type OverviewResult = ReturnType<typeof useWorldOverview>;

/**
 * Propriétés du composant {@link DomainsSection}.
 */
export type DomainsSectionProps = {
    /**
     * Fonction de traduction pour le namespace `world`.
     */
    t: (key: string) => string;

    /**
     * Résultat du hook d’overview (contient état + données éventuelles).
     */
    overview: OverviewResult;

    /**
     * Indique si les métriques sont en cours de chargement.
     */
    isLoading: boolean;

    /**
     * Indique si des données valides sont disponibles (contrat de la vue parente).
     */
    hasData: boolean;

    /**
     * Handler d’ouverture de la vue de détail d’un domaine.
     *
     * @param domain - Identifiant du domaine.
     */
    onOpenDomainDetail: (domain: Domain) => void;

    /**
     * Handler d’ouverture du Quick Log avec (optionnellement) un domaine pré-sélectionné.
     *
     * @param domain - Identifiant optionnel du domaine.
     */
    onOpenQuickLog: (domain?: Domain) => void;
};

/**
 * Section affichant les trois cartes KPI de domaine.
 *
 * Stratégie d’UI :
 * - `isLoading` : rend 3 cartes skeleton pour préserver le layout.
 * - absence de données (`!hasData` ou `overview.data == null`) : rend 3 cartes d’erreur.
 * - sinon : rend les 3 cartes `DomainCardKpiV2` alimentées par `overview.data`.
 *
 * @param props - Propriétés du composant.
 * @returns Section “Domaines”.
 */
export function DomainsSection(props: DomainsSectionProps) {
    const { t, overview, isLoading, hasData, onOpenDomainDetail, onOpenQuickLog } = props;

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
