"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { fetchUserPrograms, type UserProgram, type UserProgramDay } from "@/lib/api/program";
import { useWorldHubOptional } from "@/feature/world/hub/WorldHubProvider";

export function TodayExercices() {
    const t = useTranslations("domainExercice");
    const [programs, setPrograms] = useState<UserProgram[] | null>(null);

    /**
     * World refresh (SPA world-v2)
     * - If rendered outside WorldHubProvider, refreshKey=0 (fallback).
     */
    const hub = useWorldHubOptional();
    const refreshKey = hub?.refreshKey ?? 0;

    /**
     * JS Date.getDay(): 0=Sunday..6=Saturday
     * Convert to ISO weekday: 1=Monday..7=Sunday
     */
    const todayIsoWeekday = useMemo(() => {
        const js = new Date().getDay(); // 0..6
        return js === 0 ? 7 : js; // 1..7
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await fetchUserPrograms();
                if (!cancelled) setPrograms(data);
            } catch {
                // Safe fallback: avoid infinite "loading"
                if (!cancelled) setPrograms([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const todays =
        programs
            ?.map((p) => {
                const day = p.days.find((d) => d.weekday !== null && d.weekday === todayIsoWeekday) ?? null;
                return { program: p, day };
            })
            .filter((x): x is { program: UserProgram; day: UserProgramDay } => x.day !== null) ?? [];

    return (
        <div className="space-y-4">
            {/* ALWAYS visible */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    {t("exercice_plan_today_title")}
                </h2>
            </div>

            {/* loading state */}
            {programs === null && (
                <div className="text-slate-400">
                    {t("exercice_plan_loading") ?? "Loading…"}
                </div>
            )}

            {/* empty state */}
            {programs !== null && todays.length === 0 && (
                <div className="text-slate-500">
                    {t("exercice_plan_today_empty") ?? "Nothing planned today 🙂"}
                </div>
            )}

            {/* list */}
            {todays.map(({ program, day }) => (
                <div key={program.id} className="p-4 bg-white border rounded-lg shadow">
                    {/* program title */}
                    <h3 className="text-sm uppercase text-slate-500 font-semibold tracking-wider">
                        {program.programTitle}
                    </h3>

                    {/* day title */}
                    <div className="mt-1 font-semibold text-slate-800">
                        {day.title}
                    </div>

                    {/* exercises */}
                    <ul className="mt-2 space-y-1">
                        {day.exercices.map((ex) => (
                            <li key={ex.id}>
                                {ex.exerciceContentName} – {ex.defaultRepetitionCount ?? 0} reps
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
