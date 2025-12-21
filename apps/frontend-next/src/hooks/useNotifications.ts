"use client";

import { useMemo } from "react";

import { useTranslations } from "@/i18n/TranslationContext";
import { useAppToasts } from "@/components/toasts/AppToastProvider";
import { useBadgeToasts } from "@/components/badges/BadgeToastProvider";
import { useConfetti } from "@/components/confetti/ConfettiProvider";
import { mapApiBadgeToToastItem } from "@/lib/badges/mapApiBadge";

import type { BadgeToastItem } from "@/types/badges";

export type NotifySessionSavedOptions = {
    /**
     * Détermine si un burst de confettis doit être déclenché.
     *
     * @remarks
     * Ce mécanisme permet de célébrer une action applicative (ex. session enregistrée)
     * même si aucun nouveau badge n’a été gagné.
     */
    celebrate?: boolean;

    /**
     * Durée d’affichage du toast (en millisecondes).
     *
     * @remarks
     * Si non spécifiée, la durée par défaut est celle définie par {@link AppToastProvider}.
     */
    autoCloseMs?: number;
};

export type NotificationsApi = {
    /**
     * Affiche des badges “gagnés en live” dans la file de toasts dédiée.
     *
     * @remarks
     * Les éléments bruts reçus de l’API sont normalisés via {@link mapApiBadgeToToastItem}
     * afin de produire des {@link BadgeToastItem} compatibles avec l’UI.
     *
     * @param apiBadges Liste brute renvoyée par l’API.
     * @returns Les items normalisés réellement ajoutés à la file de toasts.
     */
    notifyBadges: (apiBadges: unknown[]) => BadgeToastItem[];

    /**
     * Affiche une confirmation de succès “session enregistrée” via le toast générique.
     *
     * @param options Options de notification (confettis, durée).
     */
    notifySessionSaved: (options?: NotifySessionSavedOptions) => void;

    /**
     * Affiche un toast d’erreur générique.
     *
     * @param message Message à afficher.
     * @param autoCloseMs Durée d’affichage éventuelle (ms).
     */
    notifyError: (message: string, autoCloseMs?: number) => void;

    /**
     * Affiche un toast d’information générique.
     *
     * @param message Message à afficher.
     * @param autoCloseMs Durée d’affichage éventuelle (ms).
     */
    notifyInfo: (message: string, autoCloseMs?: number) => void;
};

/**
 * Hook de notifications unifiées (toasts + confettis).
 *
 * @remarks
 * Ce hook fournit une façade stable pour les notifications UI.
 * Il centralise :
 * - les toasts applicatifs (succès/erreur/info) via {@link AppToastProvider},
 * - les toasts de badges via {@link BadgeToastProvider},
 * - le déclenchement des confettis via {@link ConfettiProvider}.
 *
 * L’objectif est de réduire la duplication de logique et de garantir des messages
 * cohérents (i18n) à travers l’application.
 *
 * @returns Une API de notifications regroupant les actions disponibles.
 */
export function useNotifications(): NotificationsApi {
    const tWorld = useTranslations("world");
    const { pushToast } = useAppToasts();
    const { pushBadges } = useBadgeToasts();
    const { fire } = useConfetti();

    return useMemo(() => {
        /**
         * Normalise et empile des badges à afficher dans la file de toasts badges.
         *
         * @param apiBadges Liste brute renvoyée par l’API.
         * @returns Les items normalisés ajoutés à la file.
         */
        function notifyBadges(apiBadges: unknown[]): BadgeToastItem[] {
            if (!apiBadges?.length) return [];
            const items = apiBadges.map(mapApiBadgeToToastItem);
            pushBadges(items);
            return items;
        }

        /**
         * Affiche une confirmation de succès pour l’enregistrement d’une session.
         *
         * @param options Options de notification.
         */
        function notifySessionSaved(options: NotifySessionSavedOptions = {}) {
            const { celebrate = false, autoCloseMs } = options;

            pushToast({
                kind: "success",
                message: tWorld("toasts.sessionSaved"),
                autoCloseMs,
            });

            if (celebrate) fire();
        }

        /**
         * Affiche un toast d’erreur.
         *
         * @param message Message à afficher.
         * @param autoCloseMs Durée d’affichage éventuelle (ms).
         */
        function notifyError(message: string, autoCloseMs?: number) {
            pushToast({ kind: "error", message, autoCloseMs });
        }

        /**
         * Affiche un toast d’information.
         *
         * @param message Message à afficher.
         * @param autoCloseMs Durée d’affichage éventuelle (ms).
         */
        function notifyInfo(message: string, autoCloseMs?: number) {
            pushToast({ kind: "info", message, autoCloseMs });
        }

        return { notifyBadges, notifySessionSaved, notifyError, notifyInfo };
    }, [fire, pushBadges, pushToast, tWorld]);
}
