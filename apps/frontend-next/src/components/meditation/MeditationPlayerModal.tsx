"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue } from "@/lib";
import { useMeditationTimer } from "@/hooks/useMeditationTimer";

type MeditationPlayerModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: (params: {
        duration: number;
        quality: MoodValue | null;
    }) => Promise<void> | void;
};

export default function MeditationPlayerModal({
                                                  open,
                                                  onClose,
                                                  onSave,
                                              }: MeditationPlayerModalProps) {
    const t = useTranslations("domainMeditation");

    const [finishedQuality, setFinishedQuality] =
        useState<MoodValue | null>(3 as MoodValue);
    const [saving, setSaving] = useState(false);

    const chimeRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        chimeRef.current = new Audio("/audio/meditation-gong.mp3");
    }, []);

    const {
        step,
        chosenDuration,
        setChosenDuration,
        remainingLabel,
        start,
        stopAndFinish,
        reset,
    } = useMeditationTimer(10, {
        onAutoFinish: () => {
            void chimeRef.current?.play();
        },
    });

    const handleClose = () => {
        reset();
        setFinishedQuality(3 as MoodValue);
        onClose();
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave({
                duration: chosenDuration,
                quality: finishedQuality,
            });
            reset();
            setFinishedQuality(3 as MoodValue);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center backdrop-blur">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {t("player_modalTitle")}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        ✕
                    </button>
                </div>

                {/* STEP: CONFIG */}
                {step === "config" && (
                    <div className="mt-6 space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                {t("player_durationLabel")}:{" "}
                                <span className="font-semibold">
                  {chosenDuration} min
                </span>
                            </label>
                            <input
                                type="range"
                                min={5}
                                max={60}
                                step={5}
                                value={chosenDuration}
                                onChange={(e) =>
                                    setChosenDuration(Number(e.target.value))
                                }
                                className="w-full mt-2"
                            />
                        </div>

                        <button
                            onClick={start}
                            className="w-full rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white"
                        >
                            {t("player_startNowButton")}
                        </button>
                    </div>
                )}

                {/* STEP: RUNNING */}
                {step === "running" && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="flex h-40 w-40 rounded-full items-center justify-center bg-gradient-to-b from-sky-100 to-sky-300 text-3xl font-semibold text-slate-800 shadow-inner">
                            {remainingLabel}
                        </div>

                        <p className="text-center text-sm text-slate-600 max-w-xs">
                            {t("player_runningText")}
                        </p>

                        <button
                            onClick={stopAndFinish}
                            className="text-xs border border-slate-200 rounded-full px-4 py-1.5 bg-white hover:bg-slate-50"
                        >
                            {t("player_stopEarlyButton")}
                        </button>
                    </div>
                )}

                {/* STEP: FINISHED */}
                {step === "finished" && (
                    <div className="mt-8 space-y-6">
                        <p className="text-sm text-slate-700">
                            {t("player_finishedText")}
                        </p>

                        <div>
                            <label className="text-xs font-medium text-slate-600">
                                {t("player_finishedQualityLabel")}
                            </label>
                            <MoodPicker
                                value={finishedQuality}
                                onChangeAction={(v) => setFinishedQuality(v)}
                                variant="row"
                                size="sm"
                                tone="minimal"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full rounded-full bg-teal-500 px-5 py-2.5 text-sm font-medium text-white"
                        >
                            {saving
                                ? t("player_savingButton")
                                : t("player_saveButton")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
