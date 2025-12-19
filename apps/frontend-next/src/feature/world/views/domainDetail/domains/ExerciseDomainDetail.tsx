"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { KpiCard, Section, Sparkline } from "../shared/ui";
import { clampRange, computeStreak, pctDelta, simpleMovingAverage } from "../shared/stats";

import { ExerciceHistoryCard } from "@/components/exercise/ExerciceHistoryCard";
import { useExerciceSessionsDetail } from "@/hooks/useExerciceSessionsDetail";

function topN<K>(entries: Map<K, number>, n: number) {
    return [...entries.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function ExerciseDomainDetail() {
    const t = useTranslations("domainExercice");
    const { sessions, loading, errorType } = useExerciceSessionsDetail(30);

    const computed = useMemo(() => {
        const all = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
        const last30 = clampRange(all, 30);

        const dayKeys = all.map((s) => s.date);
        const { current, best } = computeStreak(dayKeys);

        const repsPerDay = last30.map((s) =>
            s.exercices.reduce((sum, ex) => sum + (ex.repetitionCount ?? 0), 0),
        );

        const avg30 =
            repsPerDay.length > 0 ? Math.round(repsPerDay.reduce((a, b) => a + b, 0) / repsPerDay.length) : 0;

        const weekA = clampRange(all, 7);
        const weekB = clampRange(all.slice(0, Math.max(0, all.length - 7)), 7);

        const weekAReps = weekA.reduce(
            (sum, s) => sum + s.exercices.reduce((x, ex) => x + (ex.repetitionCount ?? 0), 0),
            0,
        );
        const weekBReps = weekB.reduce(
            (sum, s) => sum + s.exercices.reduce((x, ex) => x + (ex.repetitionCount ?? 0), 0),
            0,
        );

        const deltaWeek = pctDelta(Math.round(weekAReps), Math.round(weekBReps));

        // Top exercise by volume (30j)
        const volumeByExercise = new Map<string, number>();
        for (const s of last30) {
            for (const ex of s.exercices) {
                const key = ex.exerciceContentName;
                volumeByExercise.set(key, (volumeByExercise.get(key) ?? 0) + (ex.repetitionCount ?? 0));
            }
        }
        const topExercise = topN(volumeByExercise, 1)[0]?.[0] ?? null;
        const top3 = topN(volumeByExercise, 3).map(([name]) => name);

        const trend = simpleMovingAverage(repsPerDay, 5);

        // ========= INSIGHTS (quantitatif) =========
        const uniqueDays = new Set(last30.map((s) => s.date));
        const activeDays = uniqueDays.size;
        const coveragePct = Math.round((activeDays / 30) * 100);

        const totalReps30 = repsPerDay.reduce((a, b) => a + b, 0);
        const bestDayReps = repsPerDay.length > 0 ? Math.max(...repsPerDay) : 0;

        // reps / session (intensité moyenne)
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

    const streakHint =
        computed.streakBest > 0 ? `${t("detail.kpi.streakBestPrefix")} ${computed.streakBest}` : undefined;

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
                    <KpiCard tone="green" label={t("detail.kpi.topExercise")} value={computed.topExercise ?? t("detail.kpi.na")} />
                </div>
            </Section>

            <Section title={t("detail.insightsTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        tone="green"
                        label={t("detail.insights.activeDays")}
                        value={`${computed.insights.activeDays}`}
                        visual={{ kind: "donut", pct: computed.insights.coveragePct, label: t("detail.insights.coverage") }}
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
                <ExerciceHistoryCard sessions={sessions} loading={loading} errorType={errorType} />
            </Section>
        </div>
    );
}
