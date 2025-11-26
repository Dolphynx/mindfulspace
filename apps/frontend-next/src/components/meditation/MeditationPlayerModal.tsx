"use client";

import { useEffect, useMemo, useState } from "react";
import type { MeditationTypeItem } from "@/lib/api/meditation";
import { useTranslations } from "@/i18n/TranslationContext";
import { BreathingLotus } from "@/components/meditation";

// Adapter les chemins à tes fichiers réels si besoin
const LOTUS_FRAMES: string[] = [
    "/images/lotus/01.png",
    "/images/lotus/02.png",
    "/images/lotus/03.png",
    "/images/lotus/04.png",
    "/images/lotus/05.png",
    "/images/lotus/06.png",
    "/images/lotus/07.png",
    "/images/lotus/08.png",
    "/images/lotus/09.png",
    "/images/lotus/10.png",
    "/images/lotus/11.png",
    "/images/lotus/12.png",
];

type BreathPhaseKey = "inhale" | "hold_full" | "exhale" | "hold_empty";

type BreathPhase = {
    key: BreathPhaseKey;
    durationMs: number;
};

type Props = {
    open: boolean;
    onCloseAction: () => void;
    onSaveAction: (data: {
        duration: number; // minutes
        quality: number | null;
        meditationTypeId: string;
    }) => Promise<void>;
    types: MeditationTypeItem[];
};

export function MeditationPlayerModal({
                                          open,
                                          onCloseAction,
                                          onSaveAction,
                                          types,
                                      }: Props) {
    const t = useTranslations("domainMeditation");
    const tb = useTranslations("breathingSession");

    const [durationMinutes, setDurationMinutes] = useState(10);
    const [quality, setQuality] = useState<number | null>(3);
    const [typeId, setTypeId] = useState<string>(types[0]?.id ?? "");

    const [phaseIndex, setPhaseIndex] = useState(0);
    const [frameIndex, setFrameIndex] = useState(0);

    // Durées des phases (en secondes) – facile à tweaker plus tard
    const inhaleSeconds = 4;
    const holdFullSeconds = 2;
    const exhaleSeconds = 4;
    const holdEmptySeconds = 2;

    const phases: BreathPhase[] = useMemo(
        () => [
            { key: "inhale", durationMs: inhaleSeconds * 1000 },
            { key: "hold_full", durationMs: holdFullSeconds * 1000 },
            { key: "exhale", durationMs: exhaleSeconds * 1000 },
            { key: "hold_empty", durationMs: holdEmptySeconds * 1000 },
        ],
        [inhaleSeconds, holdFullSeconds, exhaleSeconds, holdEmptySeconds],
    );

    const currentPhase = phases[phaseIndex];

    const phaseLabel = (() => {
        switch (currentPhase.key) {
            case "inhale":
                return tb("phaseInhale");
            case "hold_full":
                return tb("hold_full");
            case "exhale":
                return tb("phaseExhale");
            case "hold_empty":
                return tb("hold_empty");
            default:
                return "";
        }
    })();

    // --- Avancement des phases (respiration) ---
    useEffect(() => {
        if (!open) return;

        const timeout = setTimeout(() => {
            setPhaseIndex((prev) => (prev + 1) % phases.length);
        }, currentPhase.durationMs);

        return () => clearTimeout(timeout);
    }, [open, currentPhase, phases.length]);

    // --- Animation des frames en fonction de la phase ---
    useEffect(() => {
        if (!open) return;

        let intervalId: number | undefined;

        if (currentPhase.key === "inhale") {
            // 0 -> dernier index
            setFrameIndex(0);
            const steps = LOTUS_FRAMES.length - 1;
            const stepMs = currentPhase.durationMs / steps;
            let i = 0;

            intervalId = window.setInterval(() => {
                setFrameIndex(i);
                i++;
                if (i >= LOTUS_FRAMES.length) {
                    window.clearInterval(intervalId);
                }
            }, stepMs);
        } else if (currentPhase.key === "hold_full") {
            // rester lotus ouvert
            setFrameIndex(LOTUS_FRAMES.length - 1);
        } else if (currentPhase.key === "exhale") {
            // dernier index -> 0
            setFrameIndex(LOTUS_FRAMES.length - 1);
            const steps = LOTUS_FRAMES.length - 1;
            const stepMs = currentPhase.durationMs / steps;
            let i = LOTUS_FRAMES.length - 1;

            intervalId = window.setInterval(() => {
                setFrameIndex(i);
                i--;
                if (i < 0) {
                    window.clearInterval(intervalId);
                }
            }, stepMs);
        } else if (currentPhase.key === "hold_empty") {
            // rester lotus fermé
            setFrameIndex(0);
        }

        return () => {
            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [open, currentPhase]);

    // Réinit quand on ouvre la modale
    useEffect(() => {
        if (open) {
            setPhaseIndex(0);
            setFrameIndex(0);
            if (types.length > 0 && !typeId) {
                setTypeId(types[0].id);
            }
        }
    }, [open, types, typeId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {t("player_modalTitle")}
                        </h2>
                        <p className="text-xs text-slate-600">
                            {t("player_description")}
                        </p>
                    </div>
                    <button
                        onClick={onCloseAction}
                        className="text-xs text-slate-500 hover:text-slate-700"
                    >
                        ✕
                    </button>
                </div>

                {/* LOTUS + TEXTE PHASE */}
                <div className="mb-5 flex flex-col items-center gap-3">
                    <BreathingLotus
                        frames={LOTUS_FRAMES}
                        frameIndex={frameIndex}
                        size={256}
                    />

                    <div className="mt-2 rounded-full bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700">
                        {phaseLabel}
                    </div>
                </div>

                {/* RÉGLAGES SÉANCE */}
                <div className="space-y-3 mb-4">
                    {/* Type */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            {t("manualForm_typeLabel")}
                        </label>
                        <select
                            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                        >
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {t(`meditationTypes.${type.slug}.name`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Durée totale (en minutes) */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            {t("player_durationLabel")} :{" "}
                            <span className="font-semibold">
                                {durationMinutes} min
                            </span>
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={60}
                            step={5}
                            value={durationMinutes}
                            onChange={(e) =>
                                setDurationMinutes(Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>

                    {/* Qualité finale (provisoire) */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            {t("player_finishedQualityLabel")}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={5}
                            value={quality ?? ""}
                            onChange={(e) =>
                                setQuality(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                )
                            }
                            className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">
                    <button
                        className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
                        onClick={onCloseAction}
                    >
                        {t("player_stopEarlyButton")}
                    </button>

                    <button
                        className="px-4 py-1.5 rounded-full bg-sky-500 text-sm font-medium text-white hover:bg-sky-600"
                        onClick={async () =>
                            onSaveAction({
                                duration: durationMinutes,
                                quality,
                                meditationTypeId: typeId,
                            })
                        }
                    >
                        {t("player_saveButton")}
                    </button>
                </div>
            </div>
        </div>
    );
}
