"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type {
    MeditationSession,
    MeditationErrorType,
    MeditationTypeItem,
} from "@/hooks/useMeditationSessions";
import { getMood } from "@/lib";

/**
 * Propriétés attendues par le composant `MeditationHistoryCard`.
 *
 * Ce composant affiche l’historique des séances sur les 7 derniers jours,
 * avec regroupement par date, total de minutes, différenciation du jour le plus récent
 * et affichage optionnel de l’humeur finale sous forme d’icône.
 */
type Props = {
    /** Liste brute des séances récupérées via l’API. */
    sessions: MeditationSession[];

    /** Indique si le chargement est en cours. */
    loading: boolean;

    /** Type d’erreur éventuelle rencontrée lors du chargement. */
    errorType: MeditationErrorType;

    /** Liste des types de méditation, utilisée pour afficher les labels. */
    types?: MeditationTypeItem[];
};

/**
 * Regroupe les séances par date, calcule :
 * - la liste des séances du jour
 * - la somme totale des minutes
 * - la dernière séance chronologique
 *
 * Le résultat est trié par date croissante.
 *
 * @param sessions Liste de séances provenant de l’API.
 * @returns Liste de groupes par jour, enrichis avec des agrégats.
 */
function groupSessionsByDate(sessions: MeditationSession[]) {
    const byDate = new Map<string, MeditationSession[]>();

    for (const s of sessions) {
        const list = byDate.get(s.date) ?? [];
        list.push(s);
        byDate.set(s.date, list);
    }

    return Array.from(byDate.entries())
        .sort(([d1], [d2]) => d1.localeCompare(d2))
        .map(([date, items]) => {
            const total = items.reduce(
                (sum, s) => sum + s.durationSeconds,
                0,
            );

            const last = items[items.length - 1];

            return {
                date,
                totalMinutes: Math.round(total / 60),
                last,
                items,
            };
        });
}

/**
 * Carte d’historique des séances sur 7 jours :
 *
 * - Affiche un résumé global (nombre de séances, minutes totales)
 * - Gère les états vide / erreur / chargement
 * - Regroupe les données par jour
 * - Valorise le dernier jour (visuel distinct)
 * - Affiche les humeurs finales via `getMood`
 *
 * Ce composant est destiné à être affiché dans un dashboard de méditation.
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

    // Indexation typeId -> type, pour retrouver les slugs et labels
    const typeMap = Object.fromEntries(types.map((type) => [type.id, type]));

    // Message d’erreur selon le type
    const loadError =
        errorType === "load" ? t("errors.loadSessions") : null;

    // Sessions regroupées par jour + stats calculées
    const grouped = groupSessionsByDate(sessions);

    // Minutes cumulées sur la période (7 derniers jours)
    const totalWeekMinutes = Math.round(
        sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60,
    );

    return (
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-slate-100">
            {/* HEADER GLOBAL */}
            <div className="flex items-baseline justify-between gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {t("last7_title")}
                    </h2>
                    {!loading && sessions.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                            {sessions.length} séances · {totalWeekMinutes} min
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

            {/* LISTE GROUPÉE PAR JOUR */}
            {!loading && grouped.length > 0 && (
                <ul className="mt-4 space-y-4">
                    {grouped.map((g, idx) => {
                        const sessionCount = g.items.length;
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
                                {/* Barre verticale décorative mindful */}
                                <span className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-teal-300 to-violet-300" />

                                <div className="pl-3">
                                    {/* HEADER DU JOUR */}
                                    <div className="flex items-baseline justify-between gap-2 mb-3">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {t("last7_dayLabel")} {g.date}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <span className="rounded-full bg-white/70 px-2 py-0.5 font-medium shadow-sm">
                                                {g.totalMinutes} min{" "}
                                                {t("last7_totalLabel")}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {sessionCount} séance
                                                {sessionCount > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {/* LISTE DES SÉANCES DU JOUR */}
                                    <ul className="mt-3 space-y-2">
                                        {g.items.map((s, index) => {
                                            const minutes = Math.round(
                                                s.durationSeconds / 60,
                                            );

                                            // Récupération du slug pour traduction du type
                                            const typeSlug =
                                                s.meditationTypeId &&
                                                typeMap[s.meditationTypeId]
                                                    ?.slug;

                                            const typeLabel =
                                                typeSlug != null
                                                    ? t(
                                                        `meditationTypes.${typeSlug}.name`,
                                                    )
                                                    : null;

                                            // Humeur après séance
                                            const mood =
                                                s.moodAfter != null
                                                    ? getMood(s.moodAfter)
                                                    : null;

                                            return (
                                                <li
                                                    key={`${g.date}-${index}`}
                                                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        {typeLabel && (
                                                            <span className="inline-flex max-w-[180px] items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                                                                {typeLabel}
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-slate-600">
                                                            {minutes} min
                                                        </span>
                                                    </div>

                                                    {mood && (
                                                        <button
                                                            type="button"
                                                            title={t(
                                                                mood.label,
                                                            )}
                                                            className="group"
                                                        >
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner transition-transform group-hover:scale-105">
                                                                <img
                                                                    src={
                                                                        mood.emoji
                                                                    }
                                                                    alt={t(
                                                                        mood.label,
                                                                    )}
                                                                    className="h-6 w-6"
                                                                />
                                                            </div>
                                                        </button>
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
