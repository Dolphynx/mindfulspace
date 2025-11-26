"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type {
    SleepSession,
    SleepErrorType,
} from "@/hooks/useSleepSessions";
import { getMood } from "@/lib";

/**
 * Propriétés attendues par le composant `SleepHistoryCard`.
 *
 */
type Props = {
    /** Liste brute des séances récupérées via l’API. */
    sessions: SleepSession[];

    /** Indique si le chargement est en cours. */
    loading: boolean;

    /** Type d’erreur éventuelle rencontrée lors du chargement. */
    errorType: SleepErrorType;
};

/**
 * Carte d’historique du sommeil sur 7 jours :
 *
 * - Affiche un résumé global
 * - Gère les états vide / erreur / chargement
 * - Valorise le dernier jour (visuel distinct)
 * - Affiche les humeurs finales via `getMood`
 *
 * Ce composant est destiné à être affiché dans un dashboard de sommeil.
 *
 * @param props Voir {@link Props}.
 */
export function SleepHistoryCard({
                                          sessions,
                                          loading,
                                          errorType,
                                      }: Props) {
    const t = useTranslations("domainSleep");

    // Message d’erreur selon le type
    const loadError =
        errorType === "load" ? t("errors.loadSessions") : null;

    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

    // Moyennes heures sur la période (7 derniers jours)
    const totalWeekHours = Math.round(
        sessions.reduce((sum, s) => sum + s.hours, 0),
    );
    const averageHours = totalWeekHours / sessions.length;

    return (
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-slate-100">
            {/* HEADER GLOBAL */}
            <div className="flex items-baseline justify-between gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {t("history_title")}
                    </h2>
                    {!loading && sessions.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                            {sessions.length} {t("history_nights")} · {averageHours} {t("history_average")}
                        </p>
                    )}
                </div>
            </div>

            {/* ERREUR DE CHARGEMENT */}
            {loadError && (
                <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            {/* ÉTAT VIDE */}
            {!loading && sessions.length === 0 && !loadError && (
                <p className="mt-4 text-sm text-slate-500">
                    {t("last7_empty")}
                </p>
            )}

            {/* LISTE SIMPLE DES SÉANCES */}
            {!loading && sorted.length > 0 && (
                <ul className="mt-4 space-y-4">
                    {sorted.map((s, idx) => {
                        const hours = Math.round(s.hours);
                        const mood =
                            s.quality != null ? getMood(s.quality) : null;

                        const isMostRecent = idx === sorted.length - 1;

                        return (
                            <li
                                key={s.date}
                                className={`relative rounded-2xl border px-4 py-3 shadow-sm ${
                                    isMostRecent
                                        ? "border-teal-100 bg-teal-50/70"
                                        : "border-slate-100 bg-slate-50"
                                }`}
                            >
                                {/* Barre décorative */}
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
                                                <img
                                                    src={mood.emoji}
                                                    alt={t(mood.label)}
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
