/**
 * @file startMeditationWizard.config.ts
 * @description
 * Constantes et helpers purs pour StartMeditationWizard.
 *
 * @remarks
 * Aucun React, aucun side-effect, aucun "use client".
 */

import type { MeditationContent } from "@/hooks/useMeditationContents";
import type { VisualBreathingConfig } from "@/components";

/**
 * Version étendue de {@link MeditationContent} pour le wizard de démarrage.
 *
 * On y ajoute une éventuelle configuration visuelle (`visualConfig`) pour les
 * méditations de type VISUAL, en conservant la compatibilité avec le typage
 * existant du reste de l’application.
 */
export type WizardMeditationContent = MeditationContent & {
    /**
     * Configuration spécifique pour les visualisations de respiration.
     * Peut être `null` ou `undefined` si aucune configuration n’est fournie
     * par le backend.
     */
    visualConfig?: VisualBreathingConfig | null;
};

/**
 * Étapes successives du wizard de démarrage de méditation.
 */
export type Step =
    | "TYPE"
    | "DURATION"
    | "CONTENT"
    | "MOOD_BEFORE"
    | "PLAYING"
    | "MOOD_AFTER"
    | "DONE";

/**
 * Durées proposées (en minutes) pour la séance.
 */
export const DURATION_OPTIONS_MIN = [5, 10, 15, 20] as const;

/**
 * Clés image associées au mode d’un contenu.
 *
 * @remarks
 * L’objectif est de supprimer les if/else répétitifs dans le rendu,
 * sans modifier la logique.
 */
export const MEDITATION_MODE_ICON_SRC: Record<
    MeditationContent["mode"],
    { src: string; alt: string }
> = {
    TIMER: { src: "/images/meditation_mode_timer.png", alt: "timer" },
    AUDIO: { src: "/images/meditation_mode_audio.png", alt: "audio" },
    VISUAL: { src: "/images/meditation_mode_visual.png", alt: "visual" },
    VIDEO: { src: "/images/meditation_mode_video.png", alt: "video" },
};

/**
 * Indique si un contenu premium doit être verrouillé (grisé + disabled).
 */
export function isPremiumContentLocked(content: MeditationContent, canAccessPremium: boolean): boolean {
    return Boolean(content.isPremium && !canAccessPremium);
}
