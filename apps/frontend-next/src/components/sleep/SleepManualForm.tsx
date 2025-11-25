"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

export default function SleepManualForm() {
    const t = useTranslations("domainSleep");

    const [durationHours, setDurationHours] = useState<number>(8);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // future API call
    }

    function handleCancel() {
        setDurationHours(8);
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
                        {durationHours} h
                    </span>
                </label>
                <input
                    type="range"
                    min={4}
                    max={12}
                    step={0.5}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
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
