"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { Section, Sparkline } from "../shared/ui";
import { clampRange, computeStreak, pctDelta, simpleMovingAverage } from "../shared/stats";

import { MeditationHistoryCard } from "@/components/meditation/MeditationHistoryCard";
import { useMeditationSessionsDetail } from "@/hooks/useMeditationSessionsDetail";

/**
 * Trie des entrées `Map<K, number>` par valeur décroissante et retourne les `n` premières.
 *
 * @typeParam K - Type des clés de la map.
 * @param entries - Source des paires (clé, score/volume).
 * @param n - Nombre maximal d’entrées à retourner.
 * @returns Tableau d’entrées triées, tronqué à `n`.
 */
function topN<K>(entries: Map<K, number>, n: number) {
    return [...entries.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

/**
 * Donut SVG minimaliste (sans dépendance) affichant un pourcentage.
 *
 * Objectif :
 * - Fournir un repère visuel compact pour une couverture ou un taux.
 *
 * Contraintes :
 * - La valeur est bornée dans l’intervalle [0, 100].
 * - Le rendu repose sur un `strokeDasharray` calculé à partir de la circonférence.
 *
 * @param props - Propriétés du donut.
 * @param props.valuePct - Pourcentage à afficher (0..100).
 * @param props.label - Libellé accessible appliqué à l’élément SVG.
 * @returns Donut SVG accompagné de la valeur texte.
 */
function Donut({
                   valuePct,
                   label,
               }: {
    valuePct: number; // 0..100
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
                    stroke="rgb(139 92 246)"
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
 * Carte d’insight (KPI) au rendu visuel accentué.
 *
 * Structure :
 * - Un titre (petit, uppercase).
 * - Une valeur principale (grande, tabulaire).
 * - Un sous-titre optionnel.
 * - Une zone “right” optionnelle (ex. donut).
 *
 * @param props - Propriétés de la carte.
 * @param props.title - Libellé de l’indicateur.
 * @param props.value - Valeur principale (déjà formatée pour l’affichage).
 * @param props.subtitle - Texte secondaire optionnel.
 * @param props.right - Élément optionnel affiché à droite (visuel/complément).
 * @param props.tone - Palette de dégradé appliquée à la barre verticale décorative.
 * @returns Carte stylée d’indicateur.
 */
function InsightCard({
                         title,
                         value,
                         subtitle,
                         right,
                         tone = "violet",
                     }: {
    title: string;
    value: string;
    subtitle?: string;
    right?: React.ReactNode;
    tone?: "violet" | "teal" | "blue";
}) {
    const bar =
        tone === "teal"
            ? "from-teal-300 to-violet-300"
            : tone === "blue"
                ? "from-sky-300 to-violet-300"
                : "from-violet-300 to-teal-300";

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-md backdrop-blur p-5">
            <span className={`pointer-events-none absolute inset-y-5 left-3 w-1 rounded-full bg-gradient-to-b ${bar}`} />
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
 * Liste de chips affichant une série de libellés.
 *
 * Comportement :
 * - Retourne `null` si la liste est vide.
 * - Affiche les éléments en wrap avec ellipsis (`truncate`) et `title` pour l’accessibilité.
 *
 * @param props - Propriétés du composant.
 * @param props.items - Libellés à afficher.
 * @returns Ensemble de chips ou `null`.
 */
function ChipList({ items }: { items: string[] }) {
    if (items.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {items.map((txt, i) => (
                <span
                    key={`${txt}-${i}`}
                    className="max-w-full truncate rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100"
                    title={txt}
                >
                    {txt}
                </span>
            ))}
        </div>
    );
}

/**
 * Vue de détail du domaine Méditation.
 *
 * Cette vue agrège des indicateurs sur les sessions de méditation :
 * - KPIs : minutes semaine, moyenne 30j, streak, type le plus fréquent.
 * - Insights : jours actifs, couverture 30j, total minutes, meilleur jour, couverture humeur.
 * - Tendance : moyenne mobile simple (SMA 5) sur les minutes par session.
 * - Historique : délégation à `MeditationHistoryCard`.
 *
 * Les calculs sont réalisés dans un `useMemo` afin de limiter les recomputations
 * aux changements de `sessions` et `types`.
 *
 * @returns Contenu React de la vue de détail Méditation.
 */
export function MeditationDomainDetail() {
    const t = useTranslations("domainMeditation");
    const { sessions, loading, errorType, types } = useMeditationSessionsDetail(30);

    /**
     * Calculs dérivés pour l’affichage.
     *
     * Étapes :
     * - Tri chronologique et fenêtrage 30 éléments.
     * - Streak (courant/meilleur) sur l’ensemble des jours disponibles.
     * - Minutes par session et agrégats (moyenne 30j, total 30j, meilleur jour).
     * - Comparaison semaine A/B (minutes) et delta en pourcentage.
     * - Fréquence des types (top 1 + top 3) en s’appuyant sur `types`.
     * - Couverture humeur (pourcentage de sessions ayant un `moodAfter` non nul).
     */
    const computed = useMemo(() => {
        const all = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
        const last30 = clampRange(all, 30);

        const dayKeys = all.map((s) => s.date);
        const { current, best } = computeStreak(dayKeys);

        const minutesPerSession = last30.map((s) => Math.round(s.durationSeconds / 60));

        const avgMin30 =
            minutesPerSession.length > 0
                ? Math.round(minutesPerSession.reduce((a, b) => a + b, 0) / minutesPerSession.length)
                : 0;

        const moodVals = last30.map((s) => s.moodAfter).filter((v): v is number => v != null);
        const avgMood30 =
            moodVals.length > 0 ? Math.round(moodVals.reduce((a, b) => a + b, 0) / moodVals.length) : null;

        const weekA = clampRange(all, 7);
        const weekB = clampRange(all.slice(0, Math.max(0, all.length - 7)), 7);

        const weekAMin = Math.round(weekA.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
        const weekBMin = Math.round(weekB.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

        const deltaWeek = pctDelta(weekAMin, weekBMin);

        const typeMap = Object.fromEntries((types ?? []).map((tp) => [tp.id, tp]));

        const countByTypeId = new Map<string, number>();
        for (const s of last30) {
            if (s.meditationTypeId) {
                countByTypeId.set(s.meditationTypeId, (countByTypeId.get(s.meditationTypeId) ?? 0) + 1);
            }
        }

        const topTypeId = topN(countByTypeId, 1)[0]?.[0] ?? null;
        const topTypeSlug = topTypeId ? typeMap[topTypeId]?.slug : null;

        const top3TypeSlugs = topN(countByTypeId, 3)
            .map(([id]) => typeMap[id]?.slug)
            .filter((slug): slug is string => typeof slug === "string");

        const trend = simpleMovingAverage(minutesPerSession, 5);

        const uniqueDays = new Set(last30.map((s) => s.date));
        const activeDays = uniqueDays.size;
        const coveragePct = Math.round((activeDays / 30) * 100);

        const totalMinutes30 = minutesPerSession.reduce((a, b) => a + b, 0);
        const bestDayMinutes = minutesPerSession.length > 0 ? Math.max(...minutesPerSession) : 0;

        const moodCoveragePct = last30.length > 0 ? Math.round((moodVals.length / last30.length) * 100) : 0;

        return {
            weekAMin,
            weekBMin,
            deltaWeek,
            avgMin30,
            avgMood30,
            streakCurrent: current,
            streakBest: best,
            topTypeSlug,
            top3TypeSlugs,
            trend,
            insights: {
                activeDays,
                coveragePct,
                totalMinutes30,
                bestDayMinutes,
                moodCoveragePct,
            },
        };
    }, [sessions, types]);

    /**
     * Indication affichée sous la KPI de streak si un meilleur streak existe.
     */
    const streakHint =
        computed.streakBest > 0 ? `${t("detail.kpi.streakBestPrefix")} ${computed.streakBest}` : undefined;

    /**
     * Libellé de delta hebdomadaire affiché en sous-titre de la KPI “minutes semaine”.
     */
    const deltaLabel = `${computed.deltaWeek}%`;

    /**
     * Résolution du nom i18n d’un type de méditation à partir de son slug.
     *
     * @param slug - Slug du type de méditation.
     * @returns Nom traduit du type.
     */
    const typeName = (slug: string) => t(`meditationTypes.${slug}.name`);

    /**
     * Top 3 des types (noms traduits) dérivés des slugs calculés.
     */
    const top3Names = computed.top3TypeSlugs.map(typeName);

    return (
        <div className="space-y-6">
            <Section title={t("detail.kpisTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InsightCard
                        tone="violet"
                        title={t("detail.kpi.weekMinutes")}
                        value={`${computed.weekAMin} min`}
                        subtitle={deltaLabel}
                    />
                    <InsightCard
                        tone="violet"
                        title={t("detail.kpi.avg30")}
                        value={`${computed.avgMin30} min`}
                    />
                    <InsightCard
                        tone="violet"
                        title={t("detail.kpi.streak")}
                        value={`${computed.streakCurrent}`}
                        subtitle={streakHint}
                    />
                    <InsightCard
                        tone="violet"
                        title={t("detail.kpi.topType")}
                        value={
                            computed.topTypeSlug
                                ? typeName(computed.topTypeSlug)
                                : t("detail.kpi.na")
                        }
                    />
                </div>
            </Section>

            <Section title={t("detail.insightsTitle")}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InsightCard
                        tone="teal"
                        title={t("detail.insights.activeDays")}
                        value={`${computed.insights.activeDays}`}
                        subtitle={`${t("detail.insights.coverage")} · ${computed.insights.coveragePct}%`}
                        right={<Donut valuePct={computed.insights.coveragePct} />}
                    />

                    <InsightCard
                        tone="violet"
                        title={t("detail.insights.totalMinutes")}
                        value={`${computed.insights.totalMinutes30} min`}
                        subtitle={t("detail.kpi.na") === "N/A" ? undefined : undefined}
                    />

                    <InsightCard
                        tone="violet"
                        title={t("detail.insights.bestDay")}
                        value={`${computed.insights.bestDayMinutes} min`}
                    />

                    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-md backdrop-blur p-5">
                        <span className="pointer-events-none absolute inset-y-5 left-3 w-1 rounded-full bg-gradient-to-b from-violet-300 to-teal-300" />
                        <div className="pl-4">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                {t("detail.insights.top3Types")}
                            </div>

                            <ChipList items={top3Names.length > 0 ? top3Names : [t("detail.kpi.na")]} />
                        </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4">
                        <div className="mt-1 rounded-2xl border border-slate-100 bg-white/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-slate-700">
                                    {t("detail.insights.moodCoverage")}
                                </div>
                                <Donut valuePct={computed.insights.moodCoveragePct} />
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                {t("detail.insights.moodCoverageShort")} · {computed.insights.moodCoveragePct}%
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title={t("detail.trendTitle")}>
                <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-700">{t("detail.trendMinutes30")}</div>
                        <div className="text-xs text-slate-500">{t("detail.trendSma5")}</div>
                    </div>
                    <div className="mt-3">
                        <Sparkline values={computed.trend} />
                    </div>
                </div>
            </Section>

            <Section title={t("detail.historyTitle")}>
                <MeditationHistoryCard sessions={sessions} loading={loading} errorType={errorType} types={types} />
            </Section>
        </div>
    );
}
