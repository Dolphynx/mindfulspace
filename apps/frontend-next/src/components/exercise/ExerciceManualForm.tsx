"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue } from "@/lib";

type ExerciceContentItem = {
    id: string;
    name: string;
};

type ExerciceManualFormProps = {
    types: ExerciceContentItem[];
    onCreateSession: (payload: {
        dateSession: string;
        quality?: MoodValue;
        exercices: {
            exerciceContentId: string;   // 👈 updated
            repetitionCount: number;
        }[];
    }) => Promise<void>;
};

// Format date for <input type="date">
function buildTodayDateInput(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, "0");
    const d = `${now.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Convert "YYYY-MM-DD" → ISO at noon
function dateInputToNoonIso(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date();
    date.setFullYear(y);
    date.setMonth(m - 1);
    date.setDate(d);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

export default function ExerciceManualForm({
                                               types,
                                               onCreateSession,
                                           }: ExerciceManualFormProps) {
    const t = useTranslations("domainExercice");

    const [isOpen, setIsOpen] = useState(false);
    const [dateInput, setDateInput] = useState(buildTodayDateInput());
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [repetitions, setRepetitions] = useState(10);
    const [quality, setQuality] = useState<MoodValue | null>(3 as MoodValue);
    const [savingManual, setSavingManual] = useState(false);

    // Preselect first available content
    useEffect(() => {
        if (!selectedContentId && types.length > 0) {
            setSelectedContentId(types[0].id);
        }
    }, [types, selectedContentId]);

    function resetForm() {
        setDateInput(buildTodayDateInput());
        setSelectedContentId(null);
        setRepetitions(10);
        setQuality(3 as MoodValue);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!selectedContentId) return;

        setSavingManual(true);
        try {
            await onCreateSession({
                dateSession: dateInputToNoonIso(dateInput),
                quality: quality ?? undefined,
                exercices: [
                    {
                        exerciceContentId: selectedContentId, // 👈 use new field
                        repetitionCount: repetitions,
                    },
                ],
            });

            resetForm();
            setIsOpen(false);
        } finally {
            setSavingManual(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* TITLE + OPEN BUTTON */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {t("manualForm_title")}
                    </h2>
                    <p className="text-sm text-slate-700">
                        {t("manualForm_description")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition-all duration-500 ${
                        isOpen
                            ? "opacity-0 scale-95 pointer-events-none"
                            : "opacity-100 scale-100 delay-700"
                    }`}
                >
                    {t("manualForm_button")}
                </button>
            </div>

            {/* COLLAPSIBLE FORM */}
            <div
                className={`transition-all duration-1000 overflow-hidden ${
                    isOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
            >
                <form
                    className="space-y-6 rounded-2xl bg-white/80 p-4 shadow-sm"
                    onSubmit={handleSubmit}
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

                    {/* CONTENT TYPE */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-600">
                            {t("manualForm_typeLabel")}
                        </label>
                        <select
                            value={selectedContentId ?? ""}
                            onChange={(e) =>
                                setSelectedContentId(e.target.value || null)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                        >
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* REPETITIONS */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-600">
                            {t("manualForm_repetitionLabel")}:{" "}
                            <span className="font-semibold">{repetitions}</span>
                        </label>

                        <input
                            type="range"
                            min={1}
                            max={50}
                            step={1}
                            value={repetitions}
                            onChange={(e) =>
                                setRepetitions(Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>

                    {/* QUALITY */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-600">
                            {t("manualForm_qualityLabel")}
                        </label>
                        <MoodPicker
                            value={quality}
                            onChangeAction={(v) => setQuality(v)}
                            variant="row"
                            size="sm"
                            tone="minimal"
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={savingManual || !selectedContentId}
                            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {savingManual
                                ? t("manualForm_savingButton")
                                : t("manualForm_saveButton")}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setIsOpen(false);
                            }}
                            className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
                        >
                            {t("manualForm_cancelButton")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
