"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type {
    ExerciceSession,
    ExerciceErrorType,
} from "@/hooks/useExerciseSessions";
import { getMood } from "@/lib";
import { ChevronDown } from "lucide-react";

/**
 * Props du composant ExerciseHistoryCard.
 */
type Props = {
    /**
     * Liste brute des séances récupérées via l’API.
     */
    sessions: ExerciceSession[];

    /**
     * Indique si le chargement est en cours.
     */
    loading: boolean;

    /**
     * Type d’erreur éventuelle rencontrée lors du chargement.
     */
    errorType: ExerciceErrorType;
};

/**
 * Regroupe les séances par date et calcule des agrégats par jour.
 *
 * @param sessions Liste de séances provenant de l’API.
 * @returns Liste de groupes par jour, triée par date croissante.
 */
function groupByDate(sessions: ExerciceSession[]) {
    const map = new Map<string, ExerciceSession[]>();

    for (const s of sessions) {
        const date = s.date;
        const list = map.get(date) ?? [];
        list.push(s);
        map.set(date, list);
    }

    return Array.from(map.entries())
        .sort(([d1], [d2]) => d1.localeCompare(d2))
        .map(([date, list]) => ({
            date,
            items: list,
            totalExercises: list.reduce(
                (sum, sess) => sum + sess.exercices.length,
                0,
            ),
            totalReps: list.reduce(
                (sum, sess) =>
                    sum +
                    sess.exercices.reduce(
                        (x, ex) => x + (ex.repetitionCount ?? 0),
                        0,
                    ),
                0,
            ),
            last: list[list.length - 1],
        }));
}

/**
 * Carte d’historique des séances d’exercice sur 7 jours :
 *
 * - Affiche un résumé global (séances, exercices, répétitions, qualité moyenne).
 * - Gère les états vide / erreur / chargement.
 * - Regroupe les données par jour.
 * - Ne conserve que les 7 derniers jours de pratique.
 * - Propose un bouton pour développer / replier la liste détaillée.
 *
 * @param props Voir {@link Props}.
 */
export function ExerciseHistoryCard({ sessions, loading, errorType }: Props) {
    const t = useTranslations("domainExercise");
    const [expanded, setExpanded] = useState(false);

    const loadError =
        errorType === "load" ? t("errors_loadHistory") : null;

    const groupedAll = useMemo(() => groupByDate(sessions), [sessions]);
    const grouped = useMemo(() => groupedAll.slice(-7), [groupedAll]);

    const sessionsForSummary = useMemo(
        () =>
            grouped.reduce(
                (all, g) => all.concat(g.items),
                [] as ExerciceSession[],
            ),
        [grouped],
    );

    const totalSessionsCount = sessionsForSummary.length;

    const totalExercises = useMemo(
        () =>
            sessionsForSummary.reduce(
                (sum, s) => sum + s.exercices.length,
                0,
            ),
        [sessionsForSummary],
    );

    const totalReps = useMemo(
        () =>
            sessionsForSummary.reduce(
                (sum, s) =>
                    sum +
                    s.exercices.reduce(
                        (x, ex) => x + (ex.repetitionCount ?? 0),
                        0,
                    ),
                0,
            ),
        [sessionsForSummary],
    );

    const qualityVals = useMemo(
        () =>
            sessionsForSummary
                .map((s) => s.quality)
                .filter((v): v is number => v != null),
        [sessionsForSummary],
    );

    const avgQuality =
        qualityVals.length > 0
            ? Math.round(
                qualityVals.reduce((a, b) => a + b, 0) / qualityVals.length,
            )
            : null;

    const avgMood = avgQuality != null ? getMood(avgQuality) : null;

    const hasData = !loading && totalSessionsCount > 0 && !loadError;

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
                            {totalSessionsCount}{" "}
                            {t("history_summary_sessions")} · {totalExercises}{" "}
                            {t("history_summary_exercises")}
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

            {/* ERROR */}
            {loadError && (
                <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            {/* EMPTY */}
            {!loading && totalSessionsCount === 0 && !loadError && (
                <p className="mt-4 text-sm text-slate-500">
                    {t("history_placeholder")}
                </p>
            )}

            {/* RÉSUMÉ KPI */}
            {hasData && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("history_totalRepsLabel")}
                        </span>
                        <span className="font-semibold">{totalReps}</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("history_totalSessionsLabel")}
                        </span>
                        <span className="font-semibold">
                            {totalSessionsCount}
                        </span>
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

            {/* LISTE DÉTAILLÉE (expanded) */}
            {hasData && expanded && grouped.length > 0 && (
                <ul className="mt-4 space-y-4">
                    {grouped.map((g, idx) => {
                        const isMostRecent = idx === grouped.length - 1;

                        return (
                            <li
                                key={g.date}
                                className={`relative rounded-2xl border px-4 py-3 shadow-sm ${
                                    isMostRecent
                                        ? "border-teal-100 bg-teal-50/70"
                                        : "border-slate-100 bg-slate-50"
                                }`}
                            >
                                <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-teal-300 to-violet-300" />

                                <div className="pl-3">
                                    {/* DATE HEADER */}
                                    <div className="mb-3 flex items-baseline justify-between gap-2">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {t("history_dayLabel")} {g.date}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <span className="rounded-full bg-white/70 px-2 py-0.5 font-medium shadow-sm">
                                                {g.totalReps}{" "}
                                                {t("history_totalLabel")}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {g.items.length}{" "}
                                                {t("history_sessionsLabel")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* LIST OF SESSIONS */}
                                    <ul className="space-y-2">
                                        {g.items.map((sess) => {
                                            const mood =
                                                sess.quality != null
                                                    ? getMood(sess.quality)
                                                    : null;

                                            return (
                                                <li
                                                    key={sess.id}
                                                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        {sess.exercices.map(
                                                            (ex, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="text-sm text-slate-600 flex items-center gap-2"
                                                                >
                                                                    <span className="text-[11px] rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">
                                                                        {
                                                                            ex.exerciceContentName
                                                                        }
                                                                    </span>
                                                                    <span className="text-slate-600">
                                                                        {
                                                                            ex.repetitionCount
                                                                        }
                                                                        x
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>

                                                    {mood && (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner">
                                                            <Image
                                                                src={mood.emoji}
                                                                alt={t(
                                                                    mood.label,
                                                                )}
                                                                width={24}
                                                                height={24}
                                                                className="h-6 w-6"
                                                            />
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
