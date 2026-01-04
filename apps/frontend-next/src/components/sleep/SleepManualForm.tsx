"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { MoodValue } from "@/lib";
import MoodPicker from "@/components/shared/MoodPicker";
import {queueSleepSession} from "@/offline-sync/sleep";
import { useNotifications } from "@/hooks/useNotifications";

type SleepManualFormProps = {
    onCreateSessionAction: (payload: {
        hours: number;
        quality?: MoodValue;
        dateSession: string;
    }) => Promise<void>;

    onCloseAction?: () => void;
};

function buildTodayDateInput(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, "0");
    const d = `${now.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function SleepManualForm({
                                            onCreateSessionAction,
                                            onCloseAction,
}: SleepManualFormProps) {
    const t = useTranslations("domainSleep");
    const { notifySessionSavedOffline } = useNotifications();

    const [durationHours, setDurationHours] = useState<number>(8);
    const [savingManual, setSavingManual] = useState(false);
    const [manualQuality, setManualQuality] =
        useState<MoodValue | null>(3 as MoodValue);
    const [dateInput, setDateInput] = useState<string>(() =>
        buildTodayDateInput(),
    );

    async function handleSubmit(e: FormEvent) {
        console.log("SleepManualForm handleSubmit");
        e.preventDefault();

        setSavingManual(true);

        const payload = {
            hours: durationHours,
            quality: manualQuality ?? undefined,
            dateSession: dateInputToNoonIso(dateInput),
        };

        try {
            if (!navigator.onLine) {
                console.log("📴 Offline — saving sleep session locally");
                await queueSleepSession(payload);
                notifySessionSavedOffline({
                    celebrate: false,
                });

                // setMessage?.("💾 Données enregistrées hors-ligne");
                resetForm();
                return;
            }

            // If online
            await onCreateSessionAction(payload);
            resetForm();
        } catch (e) {
            console.error(e);
        } finally {
            setSavingManual(false);
        }
    }

    function dateInputToNoonIso(dateStr: string): string {
        const [y, m, d] = dateStr.split("-").map(Number);
        const date = new Date();
        date.setFullYear(y);
        date.setMonth(m - 1);
        date.setDate(d);
        date.setHours(12, 0, 0, 0);
        return date.toISOString();
    }

    function handleCancel() {
        resetForm();
        onCloseAction?.();
    }

    function resetForm() {
        setDateInput(buildTodayDateInput());
        setDurationHours(8);
        setManualQuality(3 as MoodValue);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white/80 p-4 shadow-sm"
        >
            {/* DATE */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                    {t("manualForm_dateLabel")}
                </label>
                <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                />
            </div>

            {/* DURATION */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                    {t("manualForm_durationLabel")}:{" "}
                    <span className="font-semibold">{durationHours} h</span>
                </label>
                <input
                    type="range"
                    min={4}
                    max={12}
                    step={1}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* MOOD */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">
                    {t("manualForm_qualityLabel")}
                </label>
                <MoodPicker
                    value={manualQuality}
                    onChangeAction={(v) => setManualQuality(v)}
                    variant="row"
                    size="sm"
                    tone="minimal"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={savingManual}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                    {t("manualForm_saveButton")}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
                >
                    {t("manualForm_cancelButton")}
                </button>
            </div>
        </form>
    );
}
