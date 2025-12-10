"use client";

import { Key, useEffect, useState} from "react";
import {useTranslations} from "@/i18n/TranslationContext";
import {fetchUserPrograms} from "@/lib/api/program";

export function TodaySleep() {
    const t = useTranslations("domainSleep");
    const [programs, setPrograms] = useState<any[] | null>(null);
    const today = new Date().getDay();

    useEffect(() => {
        (async () => {
            const data = await fetchUserPrograms();
            setPrograms(data);
        })();
    }, []);

    const todays = programs
        ?.map(p => ({
            program: p,
            day: p.days.find((d: { weekday: number }) => d.weekday === today),
        }))
        .filter(x => x.day) ?? [];

    return (
        <div className="space-y-4">

            {/* ALWAYS visible */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    {t("sleep_plan_today_title")}
                </h2>
            </div>

            {/* loading state */}
            {programs === null && (
                <div className="text-slate-400">
                    {t("sleep_plan_loading") ?? "Loading…"}
                </div>
            )}

            {/* empty state */}
            {programs && todays.length === 0 && (
                <div className="text-slate-500">
                    {t("sleep_plan_today_empty") ?? "Nothing planned today 🙂"}
                </div>
            )}

            {/* list */}
            {todays.map(({program, day}) => (
                <div key={program.id} className="p-4 bg-white border rounded-lg shadow">
                    {/* program title */}
                    <h3 className="text-sm uppercase text-slate-500 font-semibold tracking-wider">
                        {program.programTitle}
                    </h3>

                    {/* day title */}
                    <div className="mt-1 font-semibold text-slate-800">
                        {day.title}
                    </div>

                    {day.sleepItems.map((sleep: { id: Key | null | undefined; hours: number; }) => (
                        <li key={sleep.id} className="text-blue-700">
                            Sleep goal: {sleep.hours ?? "—"} hours
                        </li>
                    ))}
                </div>
            ))}

        </div>
    );
}
