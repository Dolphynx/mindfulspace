"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Étapes possibles du timer de méditation.
 *
 * - `config` : l'utilisateur choisit la durée.
 * - `running` : le timer est en cours.
 * - `finished` : la séance est terminée (automatiquement ou manuellement).
 */
export type MeditationTimerStep = "config" | "running" | "finished";

/**
 * Options de configuration du hook `useMeditationTimer`.
 */
type UseMeditationTimerOptions = {
    /**
     * Callback déclenché lorsque le timer arrive automatiquement à zéro.
     * Utilisé par l’UI pour passer à un écran de fin, jouer un son, etc.
     */
    onAutoFinish?: () => void;
};

/**
 * Hook gérant un timer de méditation structuré en trois étapes :
 * configuration, exécution, fin.
 *
 * Fonctionnalités :
 * - décompte basé sur un `endAt` absolu pour éviter les dérives des timers.
 * - nettoyage automatique du `setInterval` lors du démontage du composant.
 * - gestion complète du cycle (start, arrêt anticipé, remise à zéro).
 *
 * @param initialDuration Durée de la séance en minutes (défaut : 10).
 * @param options Options telles que `onAutoFinish`.
 *
 * @returns Méthodes de contrôle du timer et états dérivés.
 */
export function useMeditationTimer(
    initialDuration: number = 10,
    options?: UseMeditationTimerOptions,
) {
    const [step, setStep] = useState<MeditationTimerStep>("config");

    /**
     * Durée choisie par l'utilisateur (en minutes).
     * Peut être ajustée avant le lancement du timer.
     */
    const [chosenDuration, setChosenDuration] =
        useState<number>(initialDuration);

    /**
     * Millisecondes restantes avant la fin du décompte.
     * La valeur est mise à jour périodiquement pendant l'exécution.
     */
    const [remainingMs, setRemainingMs] = useState<number>(0);

    /**
     * Timestamp Unix représentant la date/heure exacte de fin du timer.
     * Stocké dans un ref pour persister entre les cycles de rendu.
     */
    const endAtRef = useRef<number | null>(null);

    /**
     * Référence vers l’interval utilisé pour le décompte.
     * Permet le nettoyage propre lors de l'arrêt ou de l'unmount.
     */
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Nettoyage à l'unmount pour éviter les fuites de timers.
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    /**
     * Lance le timer :
     * - calcule l'instant de fin basé sur `chosenDuration`
     * - initialise `remainingMs`
     * - démarre un interval de mise à jour
     */
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

            // Fin automatique du timer
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

    /**
     * Arrête immédiatement le timer et passe à l’étape `finished`.
     * Utilisé lorsqu’un utilisateur décide de terminer la séance avant l'heure.
     */
    const stopAndFinish = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        endAtRef.current = null;
        setRemainingMs(0);
        setStep("finished");
    };

    /**
     * Réinitialise complètement le timer :
     * - arrêt de l’interval
     * - retour à l’étape de configuration
     * - restauration de la durée initiale
     */
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

    /**
     * Formatage de `remainingMs` sous forme `mm:ss`.
     * Cette valeur dérivée est recalculée à chaque rendu.
     */
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
