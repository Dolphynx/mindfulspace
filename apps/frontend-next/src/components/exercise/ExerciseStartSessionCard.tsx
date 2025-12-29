"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ExerciceContentItem } from "@/lib/api/exercise";
import { useTranslations } from "@/i18n/TranslationContext";
import MoodPicker from "@/components/shared/MoodPicker";
import { MoodValue } from "@/lib"; // ✅ use the real one

/**
 * Props du composant ExerciseStartSessionCard.
 */
type Props = {
    /**
     * Liste des exercices disponibles.
     */
    types: ExerciceContentItem[];

    /**
     * Callback de sauvegarde de la séance.
     */
    onSave: (data: {
        exerciceContentId: string;
        repetitionCount: number;
        quality: number | null;
    }) => Promise<void>;

    /**
     * Callback appelé lors de l’annulation.
     */
    onCancel: () => void;
};

/**
 * Carte de démarrage d’une séance d’exercice.
 *
 * @remarks
 * - Sélection d’un exercice.
 * - Réglage du nombre de répétitions.
 * - Affichage des étapes de l’exercice (avec image optionnelle).
 * - Sélection de la qualité ressentie via un sélecteur d’humeur.
 */
export function ExerciseStartSessionCard({ types, onSave, onCancel }: Props) {
    const t = useTranslations("domainExercise");

    const [selectedId, setSelectedId] = useState("");
    const [stepIndex, setStepIndex] = useState(0);
    const [repetitionCount, setRepetitionCount] = useState(10);
    const [quality, setQuality] = useState<MoodValue | null>(3 as MoodValue);

    const selectedType = types.find((t) => t.id === selectedId);
    const steps = selectedType?.steps ?? [];
    const hasSelected = Boolean(selectedType);

    useEffect(() => {
        if (!selectedId && types.length > 0) {
            setSelectedId(types[0].id);
        }
    }, [types, selectedId]);

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
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full ..."
                >
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
                        <span className="font-semibold ml-1">
                            {repetitionCount}
                        </span>
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={50}
                        value={repetitionCount}
                        onChange={(e) =>
                            setRepetitionCount(Number(e.target.value))
                        }
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
                            <Image
                                src={steps[stepIndex].imageUrl}
                                alt=""
                                width={512}
                                height={256}
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
                            onClick={() =>
                                setStepIndex(
                                    Math.min(
                                        stepIndex + 1,
                                        steps.length - 1,
                                    ),
                                )
                            }
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
                <div className="flex items-center gap-3 mt-3">
                    <button
                        className="flex-1 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium"
                        onClick={() =>
                            onSave({
                                exerciceContentId: selectedId,
                                repetitionCount,
                                quality,
                            })
                        }
                    >
                        {t("start_finishButton")}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm text-slate-600 underline underline-offset-2"
                    >
                        {t("manualForm_cancelButton")}
                    </button>
                </div>
            )}

            {!hasSelected && (
                <div className="rounded-xl bg-white/80 p-4 text-center border border-dashed text-slate-500">
                    {t("start_placeholder")}
                </div>
            )}
        </div>
    );
}
