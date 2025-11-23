"use client";

import { useEffect, useRef, useState } from "react";

export type MeditationTimerStep = "config" | "running" | "finished";

type UseMeditationTimerOptions = {
    onAutoFinish?: () => void; // appelé quand le timer arrive à 0
};

/**
 * Gère le timer de méditation (config → running → finished).
 */
export function useMeditationTimer(
    initialDuration: number = 10,
    options?: UseMeditationTimerOptions,
) {
    const [step, setStep] = useState<MeditationTimerStep>("config");
    const [chosenDuration, setChosenDuration] =
        useState<number>(initialDuration);
    const [remainingMs, setRemainingMs] = useState<number>(0);

    const endAtRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Nettoyage à l'unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const start = () => {
        const now = Date.now();
        const endAt = now + chosenDuration * 60 * 1000;

        endAtRef.current = endAt;
        setRemainingMs(endAt - now);
        setStep("running");

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const end = endAtRef.current;
            if (!end) return;

            const diff = end - Date.now();
            if (diff <= 0) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                endAtRef.current = null;
                setRemainingMs(0);
                setStep("finished");
                options?.onAutoFinish?.();
            } else {
                setRemainingMs(diff);
            }
        }, 500);
    };

    const stopAndFinish = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        endAtRef.current = null;
        setRemainingMs(0);
        setStep("finished");
    };

    const reset = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        endAtRef.current = null;
        setRemainingMs(0);
        setStep("config");
        setChosenDuration(initialDuration);
    };

    const remainingLabel = (() => {
        const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
        const m = `${Math.floor(totalSec / 60)}`.padStart(2, "0");
        const s = `${totalSec % 60}`.padStart(2, "0");
        return `${m}:${s}`;
    })();

    return {
        step,
        chosenDuration,
        setChosenDuration,
        remainingMs,
        remainingLabel,
        start,
        stopAndFinish,
        reset,
    };
}
