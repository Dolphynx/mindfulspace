"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { KpiCard, Section, Sparkline } from "../shared/ui";
import { clampRange, computeStreak, pctDelta, simpleMovingAverage } from "../shared/stats";

import { ExerciseHistoryCard } from "@/components/exercise/ExerciseHistoryCard";
import { useExerciseSessionsDetail } from "@/hooks/useExerciseSessionsDetail";

/**
 * Trie des entrées de type `Map<K, number>` par valeur décroissante et retourne les `n` premières.
 *
 * @typeParam K - Type des clés de la map.
 * @param entries - Map contenant des paires (clé, volume).
 * @param n - Nombre maximal d’éléments à retourner.
 * @returns Tableau d’entrées triées de longueur `<= n`.
 */
function topN<K>(entries: Map<K, number>, n: number) {
    return [...entries.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/**
 * Vue de détail pour le domaine Exercice.
 *
 * Cette vue calcule des KPIs et insights à partir des sessions d’exercice :
 * - Volume hebdomadaire (répétitions) et variation vs semaine précédente.
 * - Moyenne sur 30 jours.
 * - Streak (courant et meilleur).
 * - Exercice le plus pratiqué (par volume de répétitions).
 * - Indicateurs “insights” (jours actifs, couverture, intensité, top 3).
 * - Tendance (SMA 5) sur les répétitions/jour.
 *
 * Les calculs sont mémoïsés via `useMemo` et sont recalculés uniquement lorsque
 * la liste de sessions change.
 *
 * @returns Contenu React de la vue de détail Exercice.
 */
export function ExerciseDomainDetail() {
    const t = useTranslations("domainExercise");
    const { sessions, loading, errorType } = useExerciseSessionsDetail(30);

    /**
     * Calculs dérivés à partir des sessions.
     *
     * Étapes principales :
     * - Tri chronologique.
     * - Extraction des 30 derniers jours (fenêtrage).
     * - Calcul du streak sur l’ensemble des jours disponibles.
     * - Calcul des répétitions par jour sur la fenêtre.
     * - Agrégats (moyenne 30j, comparatif semaine A/B).
     * - Top exercices par volume (30j).
     * - Tendance via moyenne mobile simple.
     * - Insights (jours actifs, couverture, intensité, top 3).
     */
    const computed = useMemo(() => {
        /**
         * Toutes les sessions triées par date ascendante.
         */
        const all = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

        /**
         * Fenêtre des 30 derniers éléments (supposés représenter 30 jours au plus).
         */
        const last30 = clampRange(all, 30);

        /**
         * Liste des clés de jour (ex. `YYYY-MM-DD`) utilisée pour le calcul de streak.
         */
        const dayKeys = all.map((s) => s.date);
        const { current, best } = computeStreak(dayKeys);

        /**
         * Répétitions totales par session/jour sur la fenêtre 30j.
         */
        const repsPerDay = last30.map((s) =>
            s.exercices.reduce((sum, ex) => sum + (ex.repetitionCount ?? 0), 0),
        );

        /**
         * Moyenne des répétitions/jour sur la fenêtre 30j.
         */
        const avg30 =
            repsPerDay.length > 0
                ? Math.round(repsPerDay.reduce((a, b) => a + b, 0) / repsPerDay.length)
                : 0;

        /**
         * Semaine courante : 7 derniers éléments.
         * Semaine précédente : 7 éléments précédant la semaine courante.
         */
        const weekA = clampRange(all, 7);
        const weekB = clampRange(all.slice(0, Math.max(0, all.length - 7)), 7);

        /**
         * Volume total de répétitions sur la semaine courante.
         */
        const weekAReps = weekA.reduce(
            (sum, s) =>
                sum + s.exercices.reduce((x, ex) => x + (ex.repetitionCount ?? 0), 0),
            0,
        );

        /**
         * Volume total de répétitions sur la semaine précédente.
         */
        const weekBReps = weekB.reduce(
            (sum, s) =>
                sum + s.exercices.reduce((x, ex) => x + (ex.repetitionCount ?? 0), 0),
            0,
        );

        /**
         * Variation relative (en %) entre la semaine courante et la précédente.
         */
        const deltaWeek = pctDelta(Math.round(weekAReps), Math.round(weekBReps));

        /**
         * Calcul des volumes par exercice sur la fenêtre 30j.
         *
         * La clé utilisée est `ex.exerciceContentName` afin de regrouper par intitulé
         * métier (plutôt que par identifiant technique si absent).
         */
        const volumeByExercise = new Map<string, number>();
        for (const s of last30) {
            for (const ex of s.exercices) {
                const key = ex.exerciceContentName;
                volumeByExercise.set(key, (volumeByExercise.get(key) ?? 0) + (ex.repetitionCount ?? 0));
            }
        }

        /**
         * Exercice dominant (top 1) et top 3 des exercices par volume.
         */
        const topExercise = topN(volumeByExercise, 1)[0]?.[0] ?? null;
        const top3 = topN(volumeByExercise, 3).map(([name]) => name);

        /**
         * Tendance via moyenne mobile simple sur 5 points.
         */
        const trend = simpleMovingAverage(repsPerDay, 5);

        // ========= INSIGHTS (quantitatif) =========

        /**
         * Nombre de jours actifs sur la fenêtre 30j.
         *
         * L’unicité est calculée sur `s.date` (jour), indépendamment du nombre
         * de sessions potentielles dans une même journée.
         */
        const uniqueDays = new Set(last30.map((s) => s.date));
        const activeDays = uniqueDays.size;

        /**
         * Couverture estimée des 30 derniers jours en pourcentage.
         *
         * Le dénominateur est fixé à 30 (fenêtre) et non au nombre d’éléments,
         * afin d’exprimer une “présence” journalière sur une période cible.
         */
        const coveragePct = Math.round((activeDays / 30) * 100);

        /**
         * Total des répétitions sur la fenêtre 30j.
         */
        const totalReps30 = repsPerDay.reduce((a, b) => a + b, 0);

        /**
         * Meilleure journée (max) sur la fenêtre 30j.
         */
        const bestDayReps = repsPerDay.length > 0 ? Math.max(...repsPerDay) : 0;

        /**
         * Intensité moyenne : répétitions par session/jour dans la fenêtre.
         */
        const intensity = last30.length > 0 ? Math.round(totalReps30 / last30.length) : 0;

        return {
            weekAReps: Math.round(weekAReps),
            deltaWeek,
            avg30,
            streakCurrent: current,
            streakBest: best,
            topExercise,
            trend,
            insights: {
                activeDays,
                coveragePct,
                totalReps30,
                bestDayReps,
                intensity,
                top3,
            },
        };
    }, [sessions]);

    /**
     * Indication additionnelle pour la KPI de streak.
     *
     * Elle n’est affichée que si un meilleur streak existe.
     */
    const streakHint =
        computed.streakBest > 0
            ? `${t("detail.kpi.streakBestPrefix")} ${computed.streakBest}`
            : undefined;

    return (
        <div className="space-y-6">
            <Section title={t("detail.kpisTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        tone="green"
                        label={t("detail.kpi.weekReps")}
                        value={`${computed.weekAReps}`}
                        hint={`${computed.deltaWeek}%`}
                    />
                    <KpiCard tone="green" label={t("detail.kpi.avg30")} value={`${computed.avg30}`} />
                    <KpiCard
                        tone="green"
                        label={t("detail.kpi.streak")}
                        value={`${computed.streakCurrent}`}
                        hint={streakHint}
                    />
                    <KpiCard
                        tone="green"
                        label={t("detail.kpi.topExercise")}
                        value={computed.topExercise ?? t("detail.kpi.na")}
                    />
                </div>
            </Section>

            <Section title={t("detail.insightsTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        tone="green"
                        label={t("detail.insights.activeDays")}
                        value={`${computed.insights.activeDays}`}
                        visual={{
                            kind: "donut",
                            pct: computed.insights.coveragePct,
                            label: t("detail.insights.coverage"),
                        }}
                    />
                    <KpiCard
                        tone="green"
                        label={t("detail.insights.totalReps")}
                        value={`${computed.insights.totalReps30}`}
                    />
                    <KpiCard
                        tone="green"
                        label={t("detail.insights.intensity")}
                        value={`${computed.insights.intensity}`}
                        hint={t("detail.insights.intensityHint")}
                    />
                    <KpiCard
                        tone="green"
                        label={t("detail.insights.top3")}
                        value=""
                        visual={{
                            kind: "pills",
                            items: computed.insights.top3,
                            emptyLabel: t("detail.kpi.na"),
                            max: 3,
                        }}
                    />
                </div>
            </Section>

            <Section
                title={t("detail.trendTitle")}
                right={
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                        SMA 5
                    </span>
                }
            >
                <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-700">{t("detail.trend30")}</div>
                        <div className="text-xs text-slate-500">{t("detail.trendSma5")}</div>
                    </div>
                    <div className="mt-3">
                        <Sparkline values={computed.trend} />
                    </div>
                </div>
            </Section>

            <Section title={t("detail.historyTitle")}>
                <ExerciseHistoryCard sessions={sessions} loading={loading} errorType={errorType} />
            </Section>
        </div>
    );
}
