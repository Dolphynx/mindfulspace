"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { Section, Sparkline } from "../shared/ui";
import { clampRange, computeStreak, pctDelta, simpleMovingAverage } from "../shared/stats";
import { SleepHistoryCard } from "@/components/sleep/SleepHistoryCard";
import { useSleepSessionsDetail } from "@/hooks/useSleepSessionsDetail";

/**
 * Arrondit un nombre à 1 décimale.
 *
 * @param n - Valeur à arrondir.
 * @returns Valeur arrondie à 1 chiffre après la virgule.
 */
function round1(n: number) {
    return Math.round(n * 10) / 10;
}

/**
 * Calcule l’écart-type (population) d’une série de valeurs.
 *
 * Hypothèses :
 * - Si la série contient 0 ou 1 élément, l’écart-type est défini à 0.
 * - La variance est calculée sur `N` (et non `N - 1`), ce qui correspond
 *   à une approche “population” plutôt que “échantillon”.
 *
 * @param values - Série numérique.
 * @returns Écart-type de la série.
 */
function stdDev(values: number[]) {
    if (values.length <= 1) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

/**
 * Donut SVG minimaliste affichant un pourcentage.
 *
 * Objectif :
 * - Visualiser une proportion (ex. couverture sur 30 jours, pourcentage “bonne qualité”).
 *
 * Contraintes :
 * - `valuePct` est borné dans [0, 100] avant calcul.
 * - Le rendu repose sur `strokeDasharray` sur une circonférence calculée.
 *
 * @param props - Propriétés du donut.
 * @param props.valuePct - Valeur en pourcentage (0..100).
 * @param props.label - Libellé accessible (appliqué à l’élément SVG).
 * @returns Donut SVG accompagné de la valeur texte.
 */
function Donut({
                   valuePct,
                   label,
               }: {
    valuePct: number;
    label?: string;
}) {
    const pct = Math.max(0, Math.min(100, valuePct));
    const r = 14;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;

    return (
        <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-label={label}>
                <circle
                    cx="20"
                    cy="20"
                    r={r}
                    fill="none"
                    stroke="rgb(226 232 240)"
                    strokeWidth="6"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={r}
                    fill="none"
                    stroke="rgb(20 184 166)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`}
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <div className="text-xs text-slate-500 tabular-nums">{pct}%</div>
        </div>
    );
}

/**
 * Indicateur visuel de note au format “pills” (5 segments).
 *
 * Interprétation :
 * - La valeur est attendue dans l’intervalle 1..5.
 * - Le composant borne la valeur dans [0, 5] pour éviter les débordements.
 *
 * @param props - Propriétés du composant.
 * @param props.value - Note numérique (1..5).
 * @returns Barre de 5 segments représentant la note.
 */
function RatingPills({ value }: { value: number }) {
    const v = Math.max(0, Math.min(5, value));
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const on = i < v;
                return (
                    <span
                        key={i}
                        className={`h-2.5 w-5 rounded-full ${on ? "bg-teal-400" : "bg-slate-200"}`}
                    />
                );
            })}
        </div>
    );
}

/**
 * Carte d’insight (KPI) au rendu accentué, utilisée dans la vue Sommeil.
 *
 * Structure :
 * - Titre (petit, uppercase)
 * - Valeur principale (large, tabulaire)
 * - Sous-titre optionnel
 * - Zone optionnelle à droite (donut, rating, etc.)
 *
 * @param props - Propriétés de la carte.
 * @param props.title - Libellé de l’indicateur.
 * @param props.value - Valeur principale formatée.
 * @param props.subtitle - Texte secondaire optionnel.
 * @param props.right - Élément optionnel rendu à droite.
 * @param props.tone - Déclinaison de dégradé appliquée à la barre latérale.
 * @returns Carte d’indicateur.
 */
function InsightCard({
                         title,
                         value,
                         subtitle,
                         right,
                         tone = "teal",
                     }: {
    title: string;
    value: string;
    subtitle?: string;
    right?: React.ReactNode;
    tone?: "teal" | "blue" | "violet";
}) {
    const bar =
        tone === "blue"
            ? "from-sky-300 to-teal-300"
            : tone === "violet"
                ? "from-violet-300 to-teal-300"
                : "from-teal-300 to-violet-300";

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-md backdrop-blur p-5">
            <span
                className={`pointer-events-none absolute inset-y-5 left-3 w-1 rounded-full bg-gradient-to-b ${bar}`}
            />
            <div className="pl-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {title}
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-slate-900 tabular-nums">
                        {value}
                    </div>
                    {subtitle && (
                        <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
                    )}
                </div>
                {right && <div className="shrink-0">{right}</div>}
            </div>
        </div>
    );
}

/**
 * Vue de détail du domaine Sommeil.
 *
 * KPIs calculés :
 * - Heures sur la semaine (et delta % vs semaine précédente).
 * - Moyenne 30 jours (heures/nuit).
 * - Streak (jours consécutifs enregistrés).
 * - Qualité moyenne (échelle 1..5) si disponible.
 *
 * Insights :
 * - Nuits actives et couverture sur 30 jours.
 * - Meilleure nuit (max heures).
 * - Pourcentage de nuits de “bonne qualité” (>= 4/5).
 * - Variabilité des heures (écart-type, en heures).
 *
 * Tendance :
 * - Moyenne mobile simple (SMA 5) sur les heures/nuit.
 *
 * Historique :
 * - Délégué à `SleepHistoryCard`.
 *
 * @returns Contenu React de la vue de détail Sommeil.
 */
export function SleepDomainDetail() {
    const t = useTranslations("domainSleep");
    const { sessions, loading, errorType } = useSleepSessionsDetail(30);

    /**
     * Calculs dérivés mémoïsés à partir des sessions.
     *
     * Étapes :
     * - Tri chronologique et fenêtrage 30 éléments.
     * - Streak sur l’ensemble des jours disponibles.
     * - Agrégats sur les heures/nuit (moyenne, meilleure nuit, tendance).
     * - Comparaison semaine A/B sur le volume d’heures.
     * - Agrégats de qualité si la donnée est renseignée.
     * - Calcul de variabilité via écart-type.
     */
    const computed = useMemo(() => {
        const all = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
        const last30 = clampRange(all, 30);

        const dayKeys = all.map((s) => s.date);
        const { current, best } = computeStreak(dayKeys);

        const hoursPerNight = last30.map((s) => round1(s.hours));

        const avg30 =
            hoursPerNight.length > 0
                ? round1(hoursPerNight.reduce((a, b) => a + b, 0) / hoursPerNight.length)
                : 0;

        const weekA = clampRange(all, 7);
        const weekB = clampRange(all.slice(0, Math.max(0, all.length - 7)), 7);

        const weekAHours = weekA.reduce((sum, s) => sum + s.hours, 0);
        const weekBHours = weekB.reduce((sum, s) => sum + s.hours, 0);

        const deltaWeek = pctDelta(Math.round(weekAHours), Math.round(weekBHours));

        const qualityVals = last30.map((s) => s.quality).filter((v): v is number => v != null);
        const avgQuality30 =
            qualityVals.length > 0
                ? Math.round(qualityVals.reduce((a, b) => a + b, 0) / qualityVals.length)
                : null;

        const trend = simpleMovingAverage(hoursPerNight, 5);

        /**
         * Nombre de nuits actives sur la fenêtre (unicité par date).
         */
        const uniqueDays = new Set(last30.map((s) => s.date));
        const activeNights = uniqueDays.size;

        /**
         * Couverture des 30 derniers jours.
         *
         * Exprime la proportion de jours avec une donnée encodée.
         */
        const coveragePct = Math.round((activeNights / 30) * 100);

        /**
         * Meilleure nuit (max heures) sur la fenêtre.
         */
        const bestNight = hoursPerNight.length > 0 ? Math.max(...hoursPerNight) : 0;

        /**
         * Pourcentage de nuits avec une qualité >= 4/5.
         */
        const goodQualityCount = last30.filter((s) => (s.quality ?? 0) >= 4).length;
        const goodQualityPct = last30.length > 0 ? Math.round((goodQualityCount / last30.length) * 100) : 0;

        /**
         * Variabilité des heures de sommeil (écart-type, en heures).
         */
        const variability = round1(stdDev(hoursPerNight));

        return {
            weekAHours: Math.round(weekAHours),
            deltaWeek,
            avg30,
            avgQuality30,
            streakCurrent: current,
            streakBest: best,
            trend,
            insights: {
                activeNights,
                coveragePct,
                bestNight,
                goodQualityPct,
                variability,
            },
        };
    }, [sessions]);

    /**
     * Indication de “meilleur streak” affichée si disponible.
     */
    const streakHint =
        computed.streakBest > 0 ? `${t("detail.kpi.streakBestPrefix")} ${computed.streakBest}` : undefined;

    /**
     * Libellé du delta hebdomadaire (en pourcentage).
     */
    const deltaLabel = `${computed.deltaWeek}%`;

    return (
        <div className="space-y-6">
            <Section title={t("detail.kpisTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InsightCard
                        tone="teal"
                        title={t("detail.kpi.weekHours")}
                        value={`${computed.weekAHours} h`}
                        subtitle={deltaLabel}
                    />
                    <InsightCard
                        tone="teal"
                        title={t("detail.kpi.avg30")}
                        value={`${computed.avg30} h`}
                    />
                    <InsightCard
                        tone="teal"
                        title={t("detail.kpi.streak")}
                        value={`${computed.streakCurrent}`}
                        subtitle={streakHint}
                    />
                    <InsightCard
                        tone="teal"
                        title={t("detail.kpi.avgQuality")}
                        value={computed.avgQuality30 == null ? t("detail.kpi.na") : `${computed.avgQuality30}/5`}
                        right={computed.avgQuality30 != null ? <RatingPills value={computed.avgQuality30} /> : null}
                    />
                </div>
            </Section>

            <Section title={t("detail.insightsTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InsightCard
                        tone="blue"
                        title={t("detail.insights.activeNights")}
                        value={`${computed.insights.activeNights}`}
                        subtitle={`${t("detail.insights.coverage")} · ${computed.insights.coveragePct}%`}
                        right={<Donut valuePct={computed.insights.coveragePct} />}
                    />

                    <InsightCard
                        tone="teal"
                        title={t("detail.insights.bestNight")}
                        value={`${computed.insights.bestNight} h`}
                    />

                    <InsightCard
                        tone="violet"
                        title={t("detail.insights.goodQuality")}
                        value={`${computed.insights.goodQualityPct}%`}
                        subtitle={t("detail.insights.goodQualityHint")}
                        right={<Donut valuePct={computed.insights.goodQualityPct} />}
                    />

                    <InsightCard
                        tone="teal"
                        title={t("detail.insights.variability")}
                        value={`${computed.insights.variability} h`}
                        subtitle={t("detail.insights.variabilityHint")}
                    />
                </div>
            </Section>

            <Section title={t("detail.trendTitle")}>
                <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-700">{t("detail.trendHours30")}</div>
                        <div className="text-xs text-slate-500">{t("detail.trendSma5")}</div>
                    </div>
                    <div className="mt-3">
                        <Sparkline values={computed.trend} />
                    </div>
                </div>
            </Section>

            <Section title={t("detail.historyTitle")}>
                <SleepHistoryCard sessions={sessions} loading={loading} errorType={errorType} />
            </Section>
        </div>
    );
}
