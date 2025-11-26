"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type {
    WorkoutSession,
    WorkoutErrorType,
    WorkoutTypeItem,
} from "@/hooks/useWorkoutSessions";
import { getMood } from "@/lib";

type Props = {
    sessions: WorkoutSession[];
    loading: boolean;
    errorType: WorkoutErrorType;
    types?: WorkoutTypeItem[];
};

/** Groups sessions by YYYY-MM-DD */
function groupByDate(sessions: WorkoutSession[]) {
    const map = new Map<string, WorkoutSession[]>();

    for (const s of sessions) {
        const date = s.date; // ✅ matches your API type: WorkoutSession.date
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
                0
            ),
            last: list[list.length - 1],
        }));
}

export function WorkoutHistoryCard({
                                       sessions,
                                       loading,
                                       errorType,
                                   }: Props) {
    const t = useTranslations("domainExercice");

    const error =
        errorType === "load"
            ? t("errors_loadHistory") || "Error loading sessions"
            : null;

    const grouped = groupByDate(sessions);

    return (
        <section className="rounded-2xl bg-white/90 p-6 shadow-sm border border-slate-100">
            {/* HEADER */}
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                    {t("history_title")}
                </h2>

                {!loading && sessions.length > 0 && (
                    <p className="text-xs text-slate-500">
                        {sessions.length} sessions
                    </p>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* EMPTY */}
            {!loading && sessions.length === 0 && !error && (
                <p className="mt-4 text-sm text-slate-500">
                    {t("history_placeholder")}
                </p>
            )}

            {/* LIST */}
            {!loading && grouped.length > 0 && (
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
                                {/* Vertical mindful bar */}
                                <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-teal-300 to-violet-300" />

                                <div className="pl-3">
                                    {/* DATE HEADER */}
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {g.date}
                                        </span>

                                        <span className="text-xs text-slate-600">
                                            {g.totalExercises} exercices
                                        </span>
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
                                                    className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 shadow-sm"
                                                >
                                                    {/* LEFT SIDE */}
                                                    <div className="flex flex-col gap-1">
                                                        {sess.exercices.map(
                                                            (ex, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="text-sm text-slate-600 flex items-center gap-2"
                                                                >
                                                                    <span className="text-[11px] rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">
                                                                        {
                                                                            ex.exerciceTypeName
                                                                        }
                                                                    </span>

                                                                    <span className="text-slate-600">
                                                                        {
                                                                            ex.repetitionCount
                                                                        }
                                                                        x
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                    {/* RIGHT SIDE: MOOD ICON */}
                                                    {mood && (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner">
                                                            <img
                                                                src={mood.emoji}
                                                                alt={t(
                                                                    mood.label
                                                                )}
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
