"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

/**
 * Configuration complète d’un exercice de respiration visuelle.
 *
 * Les valeurs sont exprimées en millisecondes pour les durées, et en
 * échelle CSS (scale) pour la taille de l’élément animé.
 */
export type VisualBreathingConfig = {
    /**
     * Nombre total de cycles complets (inhale → hold_full → exhale → hold_empty).
     */
    totalCycles: number;
    /**
     * Durée de la phase d’inspiration (en millisecondes).
     */
    inhaleMs: number;
    /**
     * Durée de la rétention à poumons pleins (en millisecondes).
     */
    holdFullMs: number;
    /**
     * Durée de la phase d’expiration (en millisecondes).
     */
    exhaleMs: number;
    /**
     * Durée de la rétention à poumons vides (en millisecondes).
     * Peut être nulle si cette phase n’est pas utilisée.
     */
    holdEmptyMs: number;
    /**
     * Échelle minimale du visuel (lotus / cercle) pendant la respiration.
     */
    minScale: number;
    /**
     * Échelle maximale du visuel (lotus / cercle) pendant la respiration.
     */
    maxScale: number;
};

/**
 * Clés représentant les différentes phases du cycle respiratoire.
 */
type PhaseKey = "inhale" | "hold_full" | "exhale" | "hold_empty";

/**
 * Propriétés du composant `WizardVisualBreathing`.
 */
type WizardVisualBreathingProps = {
    /**
     * Titre affiché au-dessus de l’animation (nom de l’exercice, contexte, etc.).
     */
    title: string;
    /**
     * Config optionnelle venant de l’API / de MeditationVisualConfig.
     * Si absente, on utilise des valeurs par défaut « 4-4-4 » sur 3 cycles.
     */
    config?: VisualBreathingConfig | null;
    /**
     * Callback appelé automatiquement à la fin des cycles.
     * (Le wizard garde en plus son bouton "Terminer la séance" en backup.)
     */
    onEnd?: () => void;
};

/**
 * Composant d’animation pour la respiration guidée.
 *
 * Il gère :
 * - la progression dans les phases (inhale, hold_full, exhale, hold_empty)
 * - le nombre de cycles à effectuer
 * - une animation de scale synchronisée avec la phase courante
 * - l’appel d’un callback `onEnd` lorsque tous les cycles sont terminés
 */
export default function WizardVisualBreathing({
                                                  title,
                                                  config,
                                                  onEnd,
                                              }: WizardVisualBreathingProps) {
    const t = useTranslations("breathingSession");

    /**
     * Configuration effective utilisée par le composant.
     * Les valeurs fournies en props sont fusionnées avec un jeu de
     * valeurs par défaut pour garantir un comportement cohérent.
     */
    const cfg: VisualBreathingConfig = {
        totalCycles: config?.totalCycles ?? 3,
        inhaleMs: config?.inhaleMs ?? 4000,
        holdFullMs: config?.holdFullMs ?? 4000,
        exhaleMs: config?.exhaleMs ?? 4000,
        holdEmptyMs: config?.holdEmptyMs ?? 0,
        minScale: config?.minScale ?? 0.9,
        maxScale: config?.maxScale ?? 1.1,
    };

    /**
     * Phase courante du cycle de respiration.
     */
    const [phase, setPhase] = useState<PhaseKey>("inhale");
    /**
     * Compteur de cycle courant (1-indexé).
     */
    const [cycle, setCycle] = useState(1);

    /**
     * Indique si le composant est toujours monté.
     * Sert à éviter de mettre à jour l’état après un unmount.
     */
    const aliveRef = useRef(true);
    /**
     * Stocke les identifiants des timeouts actifs afin de pouvoir les nettoyer.
     */
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    /**
     * Effet principal orchestrant la séquence des phases de respiration.
     *
     * Il construit une séquence de phases (inhale, hold_full, exhale, éventuellement hold_empty)
     * et enchaîne ces phases en utilisant des `setTimeout` successifs.
     * À chaque boucle complète de la séquence, le compteur de cycles est incrémenté.
     * Une fois le nombre de cycles atteint, la callback `onEnd` est appelée.
     */
    useEffect(() => {
        aliveRef.current = true;

        const sequence: { p: PhaseKey; d: number }[] = [
            { p: "inhale", d: cfg.inhaleMs },
            { p: "hold_full", d: cfg.holdFullMs },
            { p: "exhale", d: cfg.exhaleMs },
        ];

        if (cfg.holdEmptyMs > 0) {
            sequence.push({ p: "hold_empty", d: cfg.holdEmptyMs });
        }

        let i = 0;

        const run = () => {
            if (!aliveRef.current) return;

            const cur = sequence[i % sequence.length];
            setPhase(cur.p);

            const tId = setTimeout(() => {
                if (!aliveRef.current) return;

                i++;

                if (i % sequence.length === 0) {
                    setCycle((prev) => {
                        const next = prev + 1;

                        if (next > cfg.totalCycles) {
                            if (onEnd) {
                                queueMicrotask(onEnd);
                            }
                            return prev;
                        }

                        return next;
                    });
                }

                run();
            }, cur.d);

            timersRef.current.push(tId);
        };

        run();

        return () => {
            aliveRef.current = false;
            for (const tId of timersRef.current) clearTimeout(tId);
            timersRef.current = [];
        };
    }, [
        cfg.inhaleMs,
        cfg.holdFullMs,
        cfg.exhaleMs,
        cfg.holdEmptyMs,
        cfg.totalCycles,
        onEnd,
    ]);

    /**
     * Libellé textuel de la phase courante, basé sur les traductions.
     */
    const phaseLabel =
        phase === "inhale"
            ? t("phaseInhale")
            : phase === "hold_full"
                ? t("phaseHold")
                : phase === "exhale"
                    ? t("phaseExhale")
                    : "";

    /**
     * Durée de transition (en ms) correspondant à la phase courante.
     * Utilisée pour piloter la durée de l’animation CSS.
     */
    const currentDuration =
        phase === "inhale"
            ? cfg.inhaleMs
            : phase === "exhale"
                ? cfg.exhaleMs
                : phase === "hold_full"
                    ? cfg.holdFullMs
                    : cfg.holdEmptyMs;

    /**
     * Scale cible à appliquer sur le visuel pour la phase courante.
     * - inspiration : expansion (maxScale)
     * - expiration : contraction (minScale)
     * - phases de rétention : échelle neutre (1)
     */
    const currentScale =
        phase === "inhale"
            ? cfg.maxScale
            : phase === "exhale"
                ? cfg.minScale
                : 1;

    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-slate-600">{title}</p>

            <div
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center text-2xl md:text-3xl text-white"
                style={{
                    transform: `scale(${currentScale})`,
                    transitionProperty: "transform",
                    transitionDuration: `${currentDuration}ms`,
                    transitionTimingFunction: "ease-in-out",
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-600" />
                <span className="relative drop-shadow-md">{phaseLabel}</span>
            </div>

            <div className="text-xs text-slate-500">
                {t("cycle")} {cycle} / {cfg.totalCycles}
            </div>
        </div>
    );
}
