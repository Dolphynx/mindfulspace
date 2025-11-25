"use client";

import { useState, useEffect, type FormEvent } from "react";
import PageHero from "@/components/PageHero";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";
import {
    useMeditationSessions,
    type MeditationErrorType,
} from "@/hooks/useMeditationSessions";
import {
    MeditationHistoryCard,
    MeditationPlayerModal,
} from "@/components/meditation";

// Helper pour le POST manuel
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

function getErrorMessage(
    t: ReturnType<typeof useTranslations>,
    errorType: MeditationErrorType,
): string | null {
    if (errorType === "load") return t("errors.loadSessions");
    if (errorType === "save") return t("errors.saveSession");
    if (errorType === "types") return t("errors.loadTypes");
    return null;
}

export default function MeditationPage() {
    const t = useTranslations("domainMeditation");

    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useMeditationSessions();

    // --- ÉTAT UI : ouverture / fermeture du formulaire manuel ---
    const [isManualFormOpen, setIsManualFormOpen] = useState(false);

    // --- Form manuel ---
    const [dateInput, setDateInput] = useState<string>(() =>
        buildTodayDateInput(),
    );

    const [manualDuration, setManualDuration] = useState<number>(10);
    const [manualQuality, setManualQuality] =
        useState<MoodValue | null>(3 as MoodValue);
    const [savingManual, setSavingManual] = useState(false);
    const [selectedTypeId, setSelectedTypeId] =
        useState<string | null>(null);

    // Player modal
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    const globalErrorMessage = getErrorMessage(t, errorType);

    // Quand les types arrivent, on choisit le premier par défaut
    useEffect(() => {
        if (!selectedTypeId && types.length > 0) {
            setSelectedTypeId(types[0].id);
        }
    }, [types, selectedTypeId]);

    // Reset complet du formulaire manuel
    function resetManualForm() {
        setDateInput(buildTodayDateInput());
        setManualDuration(10);
        setManualQuality(3 as MoodValue);
        setSelectedTypeId(null); // l'effet ci-dessus remettra le premier type
    }

    // Soumission manuelle
    async function handleManualSubmit(e: FormEvent) {
        e.preventDefault();
        if (!selectedTypeId) {
            // pas de type → on refuse l'envoi silencieusement
            return;
        }

        setSavingManual(true);

        try {
            await createSession({
                durationSeconds: manualDuration * 60,
                moodAfter: manualQuality ?? undefined,
                dateSession: dateInputToNoonIso(dateInput),
                meditationTypeId: selectedTypeId,
            });

            // Une fois sauvegardé : on replie la box et on reset
            resetManualForm();
            setIsManualFormOpen(false);
        } catch {
            // l'erreur est signalée via errorType + globalErrorMessage
        } finally {
            setSavingManual(false);
        }
    }

    return (
        <main className="text-brandText flex flex-col">
            {/* HERO FULL WIDTH */}
            <PageHero
                title={t("title")}
                subtitle={t("subtitle")}
            />

            {/* CONTENU CENTRAL CONSTRAINED */}
            <section className="mx-auto max-w-5xl w-full px-4 pt-8 pb-10">
                {globalErrorMessage && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {globalErrorMessage}
                    </div>
                )}

                <div className="mt-4 grid gap-8 lg:grid-cols-[2fr,1.5fr]">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {/* --------- BOX "ENCODER UNE MEDITATION" (collapsable animé) --------- */}
                        <section className="rounded-2xl bg-gradient-to-r from-sky-100 to-indigo-100 p-6 shadow-sm">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            {t("manualForm_title")}
                                        </h2>
                                        <p className="text-sm text-slate-700">
                                            {t("manualForm_description")}
                                        </p>
                                    </div>

                                    {/* Bouton toujours présent, mais animé */}
                                    <button
                                        type="button"
                                        onClick={() => setIsManualFormOpen(true)}
                                        className={`rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white transition-all duration-500
                    ${
                                            isManualFormOpen
                                                ? "opacity-0 scale-95 pointer-events-none"
                                                : "opacity-100 scale-100 delay-700"
                                        }`}
                                    >
                                        {t("manualForm_button")}
                                    </button>
                                </div>

                                {/* Conteneur animé */}
                                <div
                                    className={`transition-all duration-1000 overflow-hidden ${
                                        isManualFormOpen
                                            ? "max-h-[600px] opacity-100 mt-2"
                                            : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <form
                                        className="space-y-6 rounded-2xl bg-white/80 p-4 shadow-sm"
                                        onSubmit={handleManualSubmit}
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

                                        {/* TYPE DE MEDITATION */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-medium text-slate-600">
                                                {t("manualForm_typeLabel")}
                                            </label>
                                            <select
                                                value={selectedTypeId ?? ""}
                                                onChange={(e) =>
                                                    setSelectedTypeId(e.target.value || null)
                                                }
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

                                        {/* SLIDER DURÉE */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-medium text-slate-600">
                                                {t("manualForm_durationLabel")}:{" "}
                                                <span className="font-semibold">
                            {manualDuration} min
                        </span>
                                            </label>
                                            <input
                                                type="range"
                                                min={5}
                                                max={60}
                                                step={5}
                                                value={manualDuration}
                                                onChange={(e) =>
                                                    setManualDuration(Number(e.target.value))
                                                }
                                                className="w-full"
                                            />
                                        </div>

                                        {/* QUALITÉ → MOODPICKER */}
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

                                        {/* BOUTONS ACTION */}
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

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetManualForm();
                                                    setIsManualFormOpen(false);
                                                }}
                                                className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </section>


                        {/* --------- START MEDITATION --------- */}
                        <section className="rounded-2xl bg-gradient-to-r from-sky-100 to-indigo-100 p-6 shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        {t("player_title")}
                                    </h2>
                                    <p className="text-sm text-slate-700">
                                        {t("player_description")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsPlayerOpen(true)}
                                    className="rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-white"
                                    disabled={types.length === 0}
                                >
                                    {t("player_startButton")}
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (HISTORY CARD) */}
                    <MeditationHistoryCard
                        sessions={sessions}
                        loading={loading}
                        errorType={errorType}
                        types={types}
                    />
                </div>
            </section>

            {/* PLAYER MODAL */}
            <MeditationPlayerModal
                open={isPlayerOpen}
                onCloseAction={() => setIsPlayerOpen(false)}
                types={types}
                onSaveAction={async ({
                                         duration,
                                         quality,
                                         meditationTypeId,
                                     }) => {
                    await createSession({
                        durationSeconds: duration * 60,
                        moodAfter: quality ?? undefined,
                        dateSession: new Date().toISOString(),
                        meditationTypeId,
                    });
                    setIsPlayerOpen(false);
                }}
            />
        </main>
    );
}
