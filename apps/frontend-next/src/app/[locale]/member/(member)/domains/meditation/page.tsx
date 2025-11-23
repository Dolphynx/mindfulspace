"use client";

import { useState, type FormEvent } from "react";
import PageHero from "@/components/PageHero";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";
import { useMeditationSessions, type MeditationErrorType,} from "@/hooks/useMeditationSessions";
import { MeditationHistoryCard, MeditationPlayerModal } from "@/components/meditation";

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

function getErrorMessage(
    t: ReturnType<typeof useTranslations>,
    errorType: MeditationErrorType,
): string | null {
    if (errorType === "load") return t("errors.loadSessions");
    if (errorType === "save") return t("errors.saveSession");
    return null;
}

export default function MeditationPage() {
    const t = useTranslations("domainMeditation");

    const {
        sessions,
        loading,
        errorType,
        createSession,
    } = useMeditationSessions();

    // Form manuel
    const [dateInput, setDateInput] = useState<string>(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = `${now.getMonth() + 1}`.padStart(2, "0");
        const d = `${now.getDate()}`.padStart(2, "0");
        return `${y}-${m}-${d}`;
    });

    const [manualDuration, setManualDuration] =
        useState<number>(10);
    const [manualQuality, setManualQuality] =
        useState<MoodValue | null>(3 as MoodValue);
    const [savingManual, setSavingManual] = useState(false);

    // Player modal
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    const globalErrorMessage = getErrorMessage(t, errorType);

    // Soumission manuelle
    async function handleManualSubmit(e: FormEvent) {
        e.preventDefault();
        setSavingManual(true);

        try {
            await createSession({
                duration: manualDuration,
                quality: manualQuality ?? undefined,
                dateSession: dateInputToNoonIso(dateInput),
            });
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
                        {/* --------- FORMULAIRE MANUEL --------- */}
                        <section className="rounded-2xl bg-white/80 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {t("manualForm_title")}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {t("manualForm_description")}
                            </p>

                            <form
                                className="mt-4 space-y-6"
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
                                        onChange={(e) =>
                                            setDateInput(e.target.value)
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                                    />
                                </div>

                                {/* SLIDER DURÉE */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-slate-600">
                                        {t("manualForm_durationLabel")} :{" "}
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
                                            setManualDuration(
                                                Number(e.target.value),
                                            )
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
                                        onChangeAction={(v) =>
                                            setManualQuality(v)
                                        }
                                        variant="row"
                                        size="sm"
                                        tone="minimal"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingManual}
                                    className="rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white"
                                >
                                    {savingManual
                                        ? t("manualForm_savingButton")
                                    : t("manualForm_saveButton")}
                                </button>
                            </form>
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
                    />
                </div>
            </section>

            {/* PLAYER MODAL */}
            <MeditationPlayerModal
                open={isPlayerOpen}
                onClose={() => setIsPlayerOpen(false)}
                onSave={async ({ duration, quality }) => {
                    await createSession({
                        duration,
                        quality: quality ?? undefined,
                        dateSession: new Date().toISOString(),
                    });
                }}
            />
        </main>
    );
}
