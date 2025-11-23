"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type {
    MeditationSession,
    MeditationErrorType,
} from "@/hooks/useMeditationSessions";
import { getMood } from "@/lib";

type Props = {
    sessions: MeditationSession[];
    loading: boolean;
    errorType: MeditationErrorType;
};

// Helpers
function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString();
}

function formatDuration(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const rest = min % 60;
    return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

function groupSessionsByDay(sessions: MeditationSession[]) {
    const groups: Record<
        string,
        { date: string; totalDuration: number; sessions: MeditationSession[] }
    > = {};

    for (const s of sessions) {
        if (!groups[s.date]) {
            groups[s.date] = {
                date: s.date,
                totalDuration: 0,
                sessions: [],
            };
        }
        groups[s.date].sessions.push(s);
        groups[s.date].totalDuration += s.duration;
    }

    return Object.values(groups).sort((a, b) =>
        a.date < b.date ? 1 : -1
    );
}

export default function MeditationHistoryCard({
                                                  sessions,
                                                  loading,
                                                  errorType,
                                              }: Props) {
    const t = useTranslations("domainMeditation");
    const tMood = useTranslations("moodPicker");

    const loadErrorMessage =
        errorType === "load" ? t("errors.loadSessions") : null;

    return (
        <section className="rounded-2xl bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
                {t("last7_title")}
            </h2>
            <p className="text-sm text-slate-600">
                {t("last7_description")}
            </p>

            <div className="mt-4">
                {loading ? (
                    <p className="text-sm text-slate-500">
                        {t("last7_loading")}
                    </p>
                ) : loadErrorMessage ? (
                    <p className="text-sm text-red-600">{loadErrorMessage}</p>
                ) : sessions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        {t("last7_empty")}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {groupSessionsByDay(sessions).map((group) => (
                            <li
                                key={group.date}
                                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                            >
                                {/* HEADER DU JOUR */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {formatDate(group.date)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {t("last7_durationLabel")}:{" "}
                                        {formatDuration(group.totalDuration)}{" "}
                                        <span className="text-[11px] text-slate-400">
                      ({group.sessions.length}×)
                    </span>
                                    </p>
                                </div>

                                {/* LISTE DES SEANCES */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {group.sessions.map((s, idx) => {
                                        const mood =
                                            s.quality != null ? getMood(s.quality) : null;
                                        const moodLabel =
                                            mood != null ? tMood(mood.label) : null;

                                        return (
                                            <div
                                                key={idx}
                                                className="group inline-flex items-center gap-3 rounded-full border border-slate-100 bg-sky-50/70 px-3.5 py-1.5 text-xs shadow-sm transition-colors hover:bg-sky-100/80"
                                            >
                                                {/* Durée */}
                                                <span className="text-slate-700 font-medium">
                          {formatDuration(s.duration)}
                        </span>

                                                {/* Qualité → lotus + tooltip */}
                                                {mood && (
                                                    <div className="relative flex items-center">
                                                        <img
                                                            src={mood.emoji}
                                                            alt={moodLabel ?? ""}
                                                            className="h-7 w-7 drop-shadow-sm"
                                                        />

                                                        {moodLabel && (
                                                            <div className="pointer-events-none absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                                                {moodLabel}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
