"use client";

import { useState } from "react";
import type { WorkoutTypeItem } from "@/lib/api/workout";
import { useTranslations } from "@/i18n/TranslationContext";
import MoodPicker from "@/components/MoodPicker";
import {MoodValue} from "@/lib";   // ✅ use the real one

type Props = {
    types: WorkoutTypeItem[];
    onSave: (data: {
        exerciceTypeId: string;
        repetitionCount: number;
        quality: number | null;
    }) => Promise<void>;
};

export function WorkoutStartSessionCard({ types, onSave }: Props) {
    const t = useTranslations("domainExercice");

    const [selectedId, setSelectedId] = useState("");
    const [stepIndex, setStepIndex] = useState(0);
    const [repetitionCount, setRepetitionCount] = useState(10);
    const [quality, setQuality] = useState<MoodValue | null>(3 as MoodValue);

    const selectedType = types.find((t) => t.id === selectedId);
    const steps = selectedType?.steps ?? [];
    const hasSelected = Boolean(selectedType);

    function handleSelect(id: string) {
        setSelectedId(id);
        setStepIndex(0);
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800">
                    {t("start_title")}
                </h2>
                <p className="text-sm text-slate-700">
                    {t("start_description")}
                </p>
            </div>

            {/* Select exercise */}
            <div>
                <label className="text-xs text-slate-500 block mb-1">
                    {t("manualForm_typeLabel")}
                </label>

                <select
                    value={selectedId}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="">
                        — {t("manualForm_selectPlaceholder")} —
                    </option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Repetition slider */}
            {hasSelected && (
                <div>
                    <label className="text-xs text-slate-500 block mb-1">
                        {t("manualForm_repetitionLabel")} :
                        <span className="font-semibold ml-1">{repetitionCount}</span>
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={50}
                        value={repetitionCount}
                        onChange={(e) => setRepetitionCount(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            )}

            {/* Steps */}
            {hasSelected && steps.length > 0 && (
                <div className="rounded-xl bg-white/80 border p-4 shadow-sm">
                    <div className="flex justify-between mb-3">
                        <span className="text-xs text-slate-500">
                            Step {stepIndex + 1} / {steps.length}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                            {selectedType?.name}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {steps[stepIndex].imageUrl && (
                            <img
                                src={steps[stepIndex].imageUrl}
                                alt=""
                                className="max-w-full max-h-64 object-contain rounded-lg shadow-sm"
                            />
                        )}

                        <h3 className="text-sm font-semibold text-slate-800">
                            {steps[stepIndex].title}
                        </h3>

                        <p className="text-sm text-slate-600 text-center">
                            {steps[stepIndex].description}
                        </p>
                    </div>

                    <div className="flex justify-between mt-4">
                        <button
                            disabled={stepIndex === 0}
                            onClick={() => setStepIndex(stepIndex - 1)}
                            className="px-3 py-1.5 rounded-full bg-slate-200 text-slate-700 text-sm disabled:opacity-50"
                        >
                            {t("start_prevButton")}
                        </button>

                        <button
                            onClick={() => setStepIndex(Math.min(stepIndex + 1, steps.length - 1))}
                            className="px-3 py-1.5 rounded-full bg-sky-500 text-white text-sm"
                        >
                            {t("start_nextButton")}
                        </button>
                    </div>
                </div>
            )}

            {/* Mood picker — REPLACED with shared component */}
            {hasSelected && (
                <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
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
            )}

            {/* Finish button */}
            {hasSelected && (
                <button
                    className="w-full mt-3 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium"
                    onClick={() =>
                        onSave({
                            exerciceTypeId: selectedId,
                            repetitionCount,
                            quality,
                        })
                    }
                >
                    {t("start_finishButton")}
                </button>
            )}

            {!hasSelected && (
                <div className="rounded-xl bg-white/80 p-4 text-center border border-dashed text-slate-500">
                    {t("start_placeholder")}
                </div>
            )}
        </div>
    );
}
