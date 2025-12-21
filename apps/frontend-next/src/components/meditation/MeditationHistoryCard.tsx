"use client";

/**
 * @file MeditationHistoryCard.tsx
 * @description
 * Carte d’historique des séances de méditation sur une fenêtre de 7 jours (7 dates max).
 *
 * @remarks
 * - La carte affiche un résumé global (minutes, nombre de séances, humeur moyenne).
 * - La liste détaillée est repliée par défaut et peut être développée.
 * - La logique de regroupement et d’agrégation est déléguée à un module “pur”.
 */

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { useTranslations } from "@/i18n/TranslationContext";
import type {
    MeditationSession,
    MeditationErrorType,
    MeditationTypeItem,
} from "@/hooks/useMeditationSessions";

import { computeMeditationHistoryModel } from "@/lib/meditation/meditationHistory";
import { MeditationHistoryDetails } from "@/components/meditation/MeditationHistoryDetails";

/**
 * Propriétés attendues par le composant {@link MeditationHistoryCard}.
 */
type Props = {
    /**
     * Liste brute des séances récupérées via l’API.
     */
    sessions: MeditationSession[];

    /**
     * Indique si le chargement est en cours.
     */
    loading: boolean;

    /**
     * Type d’erreur éventuelle rencontrée lors du chargement.
     */
    errorType: MeditationErrorType;

    /**
     * Liste des types de méditation, utilisée pour afficher les labels.
     */
    types?: MeditationTypeItem[];
};

/**
 * Carte d’historique des séances sur 7 jours.
 *
 * @param props Voir {@link Props}.
 */
export function MeditationHistoryCard({
                                          sessions,
                                          loading,
                                          errorType,
                                          types = [],
                                      }: Props) {
    const t = useTranslations("domainMeditation");
    const [expanded, setExpanded] = useState(false);

    const {
        grouped,
        totalWeekMinutes,
        totalSessionsCount,
        averageMood,
        loadError,
        hasData,
        typeMap,
    } = computeMeditationHistoryModel({
        sessions,
        loading,
        errorType,
        types,
        t,
    });

    return (
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">{t("last7_title")}</h2>

                    {hasData && (
                        <p className="mt-1 text-xs text-slate-500">
                            {totalSessionsCount} {t("last7_summary_sessions")} · {totalWeekMinutes}{" "}
                            {t("last7_summary_minutes")}
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
                            {expanded ? t("last7_toggle_collapse") : t("last7_toggle_expand")}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                    </button>
                )}
            </div>

            {loadError && (
                <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            {!loading && totalSessionsCount === 0 && !loadError && (
                <p className="mt-4 text-sm text-slate-500">{t("last7_empty")}</p>
            )}

            {hasData && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("last7_totalMeditationLabel")}
                        </span>
                        <span className="font-semibold">{totalWeekMinutes} min</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex flex-col text-sm text-slate-700">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {t("last7_totalSessionsLabel")}
                        </span>
                        <span className="font-semibold">{totalSessionsCount}</span>
                    </div>

                    {averageMood && (
                        <>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                    {t("last7_averageMoodLabel")}
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner">
                                    <Image
                                        src={averageMood.emoji}
                                        alt={t(averageMood.label)}
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

            {hasData && expanded && grouped.length > 0 && (
                <MeditationHistoryDetails t={t} grouped={grouped} typeMap={typeMap} />
            )}
        </section>
    );
}
