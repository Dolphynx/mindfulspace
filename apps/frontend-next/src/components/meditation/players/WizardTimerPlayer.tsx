"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Propriétés du composant `WizardTimerPlayer`.
 */
type WizardTimerPlayerProps = {
    /**
     * Titre affiché au-dessus du timer (nom de la pratique, indication de contexte, etc.).
     */
    title: string;
    /**
     * Durée totale en secondes (issue du wizard).
     * Sert de base au décompte et au calcul de la progression.
     */
    totalSeconds: number;
    /**
     * Callback appelé automatiquement à la fin du compte à rebours.
     * Peut être utilisé pour passer à l’étape suivante du wizard.
     */
    onEnd?: () => void;
};

/**
 * États possibles du timer :
 * - `running` : le compte à rebours est en cours
 * - `paused` : le timer est en pause
 * - `finished` : le décompte est arrivé à zéro
 */
type TimerStatus = "running" | "paused" | "finished";

/**
 * Timer simple utilisé dans le wizard de méditation.
 *
 * Ce composant affiche :
 * - un compte à rebours formaté mm:ss
 * - une barre de progression basée sur la durée totale
 * - des contrôles locaux (pause/reprise, reset)
 *
 * À l’expiration du timer (`0` seconde restante), la callback `onEnd`
 * est déclenchée (si fournie), permettant au wizard de changer d’étape.
 */
export default function WizardTimerPlayer({
                                              title,
                                              totalSeconds,
                                              onEnd,
                                          }: WizardTimerPlayerProps) {
    const t = useTranslations("domainMeditation");

    /**
     * Nombre de secondes restantes avant la fin du compte à rebours.
     * Initialisé à `totalSeconds` lors du montage du composant.
     */
    const [remaining, setRemaining] = useState<number>(totalSeconds);

    /**
     * Statut courant du timer (`running`, `paused` ou `finished`).
     * Contrôle le déclenchement ou non du setInterval.
     */
    const [status, setStatus] = useState<TimerStatus>("running");

    /**
     * Effet responsable du tick du timer.
     *
     * Tant que le statut est `running` et qu’il reste du temps,
     * un intervalle est déclenché toutes les secondes pour décrémenter
     * la valeur de `remaining`. Lorsque le décompte atteint zéro :
     * - le statut passe à `finished`
     * - la callback `onEnd` est appelée (si fournie)
     */
    useEffect(() => {
        if (status !== "running") return;
        if (remaining <= 0) return;

        const id = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    // On arrive à zéro : on stoppe et on déclenche onEnd
                    clearInterval(id);
                    setStatus("finished");
                    if (onEnd) {
                        queueMicrotask(onEnd);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [status, remaining, onEnd]);

    /**
     * Bascule l’état du timer entre `running` et `paused`.
     * N’a pas d’effet lorsque le timer est terminé.
     */
    const handleToggle = () => {
        if (status === "running") setStatus("paused");
        else if (status === "paused") setStatus("running");
    };

    /**
     * Réinitialise le timer à sa valeur initiale (`totalSeconds`)
     * et relance immédiatement le décompte.
     */
    const handleReset = () => {
        setRemaining(totalSeconds);
        setStatus("running");
    };

    /**
     * Minutes restantes (partie entière) extraites de `remaining`.
     */
    const minutes = Math.floor(remaining / 60);

    /**
     * Secondes restantes (reste de la division par 60).
     */
    const seconds = remaining % 60;

    /**
     * Libellé formaté pour l’affichage du temps, sous la forme `mm:ss`.
     * Exemple : `05:09`.
     */
    const label = `${String(minutes).padStart(2, "0")}:${String(
        seconds,
    ).padStart(2, "0")}`;

    /**
     * Pourcentage de progression du timer par rapport à la durée totale.
     * Utilisé pour piloter la largeur de la barre de progression.
     */
    const progress =
        totalSeconds > 0
            ? ((totalSeconds - remaining) / totalSeconds) * 100
            : 0;

    /**
     * Indique si le timer est en cours de décompte.
     */
    const isRunning = status === "running";

    /**
     * Indique si le timer a terminé son décompte.
     */
    const isFinished = status === "finished";

    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-slate-600 text-center">{title}</p>

            {/* Affichage principal du temps */}
            <div className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-8 py-6 shadow-inner">
                <span className="tabular-nums text-4xl font-semibold text-slate-800">
                    {label}
                </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full max-w-md space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{t("wizard_timer_remainingLabel")}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    />
                </div>
            </div>

            {/* Boutons de contrôle locaux */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleToggle}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                    {isRunning
                        ? t("wizard_timer_pause")
                        : t("wizard_timer_resume")}
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    disabled={remaining === totalSeconds && !isFinished}
                >
                    {t("wizard_timer_reset")}
                </button>
            </div>

            {isFinished && (
                <p className="text-xs text-emerald-600">
                    {t("wizard_timer_finished")}
                </p>
            )}
        </div>
    );
}
