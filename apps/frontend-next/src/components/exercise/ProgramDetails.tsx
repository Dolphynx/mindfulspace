"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type { ProgramItem } from "@/lib/api/program";
import { usePrograms } from "@/hooks/usePrograms";
import { useEffect, useState } from "react";

export function ProgramDetails({
                                   program,
                                   onBack,
                                   onSubscribe,
                               }: {
    program: ProgramItem;
    onBack: () => void;
    onSubscribe: () => void;
}) {
    const t = useTranslations("domainExercice");

    const uniqueWeekdays = new Set(program.days.map((d) => d.weekday)).size;

    return (
        <div className="space-y-4">
            <button
                onClick={onBack}
                className="text-sm text-slate-600 underline hover:text-slate-800"
            >
                ← {t("program_details_back")}
            </button>

            <h2 className="text-2xl font-semibold text-slate-800">
                {program.title}
            </h2>

            {program.description && (
                <p className="text-slate-600">{program.description}</p>
            )}

            <p className="text-sm text-slate-500">
                {uniqueWeekdays} {t("program_list_daysPerWeek")}
            </p>

            {/* Days */}
            <div className="space-y-3">
                {program.days.map((day) => (
                    <div
                        key={day.id}
                        className="p-3 rounded-lg bg-white shadow-sm border"
                    >
                        <p className="font-medium">
                            {t("weekday_" + day.weekday?.toString())}
                        </p>

                        <ul className="pl-4 list-disc">
                            {day.exerciceItems.map((ex, idx) => (
                                <li key={idx}>
                                    {ex.exerciceContent?.name} — {ex.defaultRepetitionCount} reps
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <button
                onClick={onSubscribe}
                className="rounded-full bg-emerald-500 px-5 py-2 text-white font-medium shadow hover:bg-emerald-600 transition"
            >
                {t("program_details_subscribe")}
            </button>
        </div>
    );
}
