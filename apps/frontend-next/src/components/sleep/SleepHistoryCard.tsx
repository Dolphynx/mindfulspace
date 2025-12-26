"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { SleepSession, SleepErrorType } from "@/hooks/useSleepSessions";
import { getMood } from "@/lib";
import { ChevronDown } from "lucide-react";

/**
 * Props du composant SleepHistoryCard.
 */
type Props = {
    /**
     * Liste brute des séances récupérées via l’API.
     */
    sessions: SleepSession[];

    /**
     * Indique si le chargement est en cours.
     */
    loading: boolean;

    /**
     * Type d’erreur éventuelle rencontrée lors du chargement.
     */
    errorType: SleepErrorType;
};

/**
 * Arrondit un nombre à un chiffre après la virgule.
 *
 * @param n Valeur à arrondir.
 * @returns Valeur arrondie à 0,1 près.
 */
function round1(n: number) {
    return Math.round(n * 10) / 10;
}

/**
 * Carte d’historique du sommeil sur 7 nuits :
 *
 * - Affiche un résumé global (heures totales, moyenne, qualité moyenne).
 * - Gère les états vide / erreur / chargement.
 * - Conserve le comportement “7 dernières nuits encodées”.
 * - Propose un bouton pour développer / replier la liste détaillée.
 *
 * @param props Voir {@link Props}.
 */
export function SleepHistoryCard({ sessions, loading, errorType }: Props) {
    const t = useTranslations("domainSleep");
    const [expanded, setExpanded] = useState(false);

    const loadError =
        errorType === "load" ? t("errors.loadSessions") : null;
    const offlineHint =
        errorType === "offline" ? t("errors.offlineUsingCache") : null;


    const sorted = useMemo(
        () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
        [sessions],
    );

    // ⚠️ Ici on garde le comportement “7 dernières nuits encodées”
    const last7 = useMemo(() => sorted.slice(0, 7), [sorted]);

    const hasData = !loading && last7.length > 0 && !loadError;

    const totalHours = useMemo(
        () => round1(last7.reduce((sum, s) => sum + s.hours, 0)),
        [last7],
    );

    const avgHours = useMemo(
        () => (last7.length > 0 ? round1(totalHours / last7.length) : 0),
        [totalHours, last7.length],
    );

    const qualityVals = useMemo(
        () => last7.map((s) => s.quality).filter((v): v is number => v != null),
        [last7],
    );

    const avgQuality =
        qualityVals.length > 0
            ? Math.round(
                qualityVals.reduce((a, b) => a + b, 0) / qualityVals.length,
            )
            : null;

    const avgMood = avgQuality != null ? getMood(avgQuality) : null;

    return (
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-slate-100">
            {/* HEADER GLOBAL */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {t("history_title")}
                    </h2>

                    {hasData && (
                        <p className="mt-1 text-xs text-slate-500">
                            {last7.length} {t("history_summary_nights")} ·{" "}
                            {avgHours} {t("history_summary_hoursAvg")}
                        </p>
                    )}
                </div>

                {hasData && (
                    <button
                        type="button"
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-expanded={expanded}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                        <span className="hidden sm:inline">
                            {expanded
                                ? t("history_toggle_collapse")
                                : t("history_toggle_expand")}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                                expanded ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                )}
            </div>

            {/* ERREUR */}
            {loadError && (
                <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            {/* VIDE */}
            {!loading && last7.length === 0 && !loadError && (
                <p className="mt-4 text-sm text-slate-500">
                    {t("history_placeholder")}
                </p>
            )}

            {/* RÉSUMÉ KPI (toujours visible si data) */}
            {hasData && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("history_totalSleepLabel")}
                        </span>
                        <span className="font-semibold">{totalHours} h</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("history_totalNightsLabel")}
                        </span>
                        <span className="font-semibold">{last7.length}</span>
                    </div>

                    {avgMood && (
                        <>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                    {t("history_averageQualityLabel")}
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner">
                                    <Image
                                        src={avgMood.emoji}
                                        alt={t(avgMood.label)}
                                        width={24}
                                        height={24}
                                        className="h-6 w-6"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* LISTE (visible uniquement quand expanded) */}
            {hasData && expanded && last7.length > 0 && (
                <ul className="mt-4 space-y-4">
                    {last7.map((s, idx) => {
                        const hours = round1(s.hours);
                        const mood =
                            s.quality != null ? getMood(s.quality) : null;

                        const isMostRecent = idx === 0;

                        return (
                            <li
                                key={s.date}
                                className={`relative rounded-2xl border px-4 py-3 shadow-sm ${
                                    isMostRecent
                                        ? "border-teal-100 bg-teal-50/70"
                                        : "border-slate-100 bg-slate-50"
                                }`}
                            >
                                <span className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-teal-300 to-violet-300" />

                                <div className="pl-3 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {s.date}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                            {hours} h
                                        </div>
                                    </div>

                                    {mood && (
                                        <button
                                            type="button"
                                            title={t(mood.label)}
                                            className="group"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-inner transition-transform group-hover:scale-105">
                                                <Image
                                                    src={mood.emoji}
                                                    alt={t(mood.label)}
                                                    width={24}
                                                    height={24}
                                                    className="h-6 w-6"
                                                />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
