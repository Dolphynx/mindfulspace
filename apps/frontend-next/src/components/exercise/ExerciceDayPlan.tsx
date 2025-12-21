"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import {useUserPrograms} from "@/hooks/useUserPrograms";
import {UserProgram, UserProgramDay} from "@/lib/api/program";

export function TodayExercices() {
    const t = useTranslations("domainExercice");
    const { programs, loading } = useUserPrograms();

    const todayIsoWeekday = useMemo(() => {
        const js = new Date().getDay();
        return js === 0 ? 7 : js;
    }, []);

    const todays =
        programs
            ?.map((p) => {
                const day =
                    p.days.find(
                        (d) => d.weekday !== null && d.weekday === todayIsoWeekday,
                    ) ?? null;
                return { program: p, day };
            })
            .filter(
                (x): x is { program: UserProgram; day: UserProgramDay } =>
                    x.day !== null,
            ) ?? [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
                {t("exercice_plan_today_title")}
            </h2>

            {loading && (
                <div className="text-slate-400">
                    {t("exercice_plan_loading") ?? "Loading…"}
                </div>
            )}

            {!loading && todays.length === 0 && (
                <div className="text-slate-500">
                    {t("exercice_plan_today_empty") ?? "Nothing planned today 🙂"}
                </div>
            )}

            {todays.map(({ program, day }) => (
                <div key={program.id} className="p-4 bg-white border rounded-lg shadow">
                    <h3 className="text-sm uppercase text-slate-500 font-semibold">
                        {program.title}
                    </h3>

                    <div className="mt-1 font-semibold text-slate-800">
                        {day.title}
                    </div>

                    <ul className="mt-2 space-y-1">
                        {day.exercices.map((ex) => (
                            <li key={ex.id}>
                                {ex.exercice.name} – {ex.defaultRepetitionCount ?? 0} reps
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

