"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

export default function ExerciseManualForm() {
    const t = useTranslations("domainExercice");

    const [durationMinutes, setDurationMinutes] =
        useState<number>(30);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // future API call
    }

    function handleCancel() {
        setDurationMinutes(30);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white/80 p-4 shadow-sm"
        >
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                    {t("manualForm_durationLabel")}:{" "}
                    <span className="font-semibold">
                        {durationMinutes} min
                    </span>
                </label>
                <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={durationMinutes}
                    onChange={(e) =>
                        setDurationMinutes(Number(e.target.value))
                    }
                    className="w-full"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white"
                >
                    {t("manualForm_saveButton")}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
                >
                    {t("manualForm_cancelButton")}
                </button>
            </div>
        </form>
    );
}
