"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import MoodPicker from "@/components/shared/MoodPicker";
import { MoodValue } from "@/lib";

/**
 * Version minimale d’un type de méditation,
 * suffisante pour l’encodage manuel.
 */
type MeditationTypeLite = {
    /**
     * Identifiant unique du type.
     */
    id: string;

    /**
     * Slug utilisé pour la traduction i18n.
     */
    slug: string;
};

/**
 * Props du composant {@link MeditationManualForm}.
 */
type MeditationManualFormProps = {
    /**
     * Liste des types de méditation disponibles.
     */
    types: MeditationTypeLite[];

    /**
     * Action de création de session de méditation.
     *
     * @remarks
     * La logique métier (API, mutation, gestion d’erreur)
     * est volontairement externalisée dans le parent.
     */
    onCreateSessionAction: (payload: {
        durationSeconds: number;
        moodAfter?: MoodValue;
        dateSession: string;
        meditationTypeId: string;
    }) => Promise<void>;

    /**
     * Ouvre le formulaire dès le rendu initial.
     *
     * @default false
     */
    defaultOpen?: boolean;

    /**
     * Mode compact :
     * - masque le header (titre / description / bouton ouvrir),
     * - affiche directement le formulaire.
     *
     * @default false
     */
    compact?: boolean;
};

function dateInputToNoonIso(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date();
    date.setFullYear(y);
    date.setMonth(m - 1);
    date.setDate(d);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
}

function buildTodayDateInput(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, "0");
    const d = `${now.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function MeditationManualForm({
                                                 types,
                                                 onCreateSessionAction,
                                                 defaultOpen = false,
                                                 compact = false,
                                             }: MeditationManualFormProps) {
    const t = useTranslations("domainMeditation");

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [dateInput, setDateInput] = useState<string>(() =>
        buildTodayDateInput(),
    );
    const [manualDuration, setManualDuration] = useState<number>(10);
    const [manualQuality, setManualQuality] = useState<MoodValue | null>(
        3 as MoodValue,
    );
    const [savingManual, setSavingManual] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedTypeId && types.length > 0) {
            setSelectedTypeId(types[0].id);
        }
    }, [types, selectedTypeId]);

    useEffect(() => {
        if (defaultOpen) setIsOpen(true);
    }, [defaultOpen]);

    function resetForm() {
        setDateInput(buildTodayDateInput());
        setManualDuration(10);
        setManualQuality(3 as MoodValue);
        setSelectedTypeId(null);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!selectedTypeId) return;

        setSavingManual(true);

        try {
            await onCreateSessionAction({
                durationSeconds: manualDuration * 60,
                moodAfter: manualQuality ?? undefined,
                dateSession: dateInputToNoonIso(dateInput),
                meditationTypeId: selectedTypeId,
            });

            resetForm();
            setIsOpen(defaultOpen || compact);

        } finally {
            setSavingManual(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {!compact && (
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
                        className={`rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white transition-all duration-500 ${
                            isOpen
                                ? "opacity-0 scale-95 pointer-events-none"
                                : "opacity-100 scale-100 delay-700"
                        }`}
                    >
                        {t("manualForm_button")}
                    </button>
                </div>
            )}

            <div
                className={`transition-all duration-700 overflow-hidden ${
                    compact || isOpen
                        ? "max-h-[700px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <form
                    className="space-y-5 rounded-2xl bg-white p-4 shadow-sm"
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

                    {/* TYPE */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-600">
                            {t("manualForm_typeLabel")}
                        </label>
                        <select
                            value={selectedTypeId ?? ""}
                            onChange={(e) => setSelectedTypeId(e.target.value || null)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                        >
                            <option value="">
                                -- {t("manualForm_typeLabel")} --
                            </option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {t(`meditationTypes.${type.slug}.name`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DURÉE */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-600">
                            {t("manualForm_durationLabel")}:{" "}
                            <span className="font-semibold">{manualDuration} min</span>
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={60}
                            step={5}
                            value={manualDuration}
                            onChange={(e) => setManualDuration(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* RESSENTI */}
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

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={savingManual || !selectedTypeId}
                            className="rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {savingManual
                                ? t("manualForm_savingButton")
                                : t("manualForm_saveButton")}
                        </button>

                        {!compact && (
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
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
