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
     * Optionnellement, un burst de confettis peut être déclenché.
     * Le provider de confettis appliquant un cooldown, plusieurs déclenchements
     * simultanés ne produisent qu’un seul burst “au même moment”.
     *
     * @param apiBadges Liste brute renvoyée par l’API.
     * @param options Options (ex. célébration).
     * @returns Les items normalisés réellement ajoutés à la file de toasts.
     */
    notifyBadges: (apiBadges: unknown[], options?: { celebrate?: boolean }) => BadgeToastItem[];

    /**
     * Affiche une confirmation de succès “session enregistrée” via le toast générique.
     *
     * @param options Options de notification (confettis, durée).
     */
    notifySessionSaved: (options?: NotifySessionSavedOptions) => void;

    /**
     * Affiche une confirmation de succès “session enregistrée hors ligne” via le toast générique.
     *
     * @param options Options de notification (confettis, durée).
     */
    notifySessionSavedOffline: (options?: NotifySessionSavedOptions) => void;

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
 * Hook de notifications unifiées (toasts + badges + confettis).
 *
 * @remarks
 * Ce hook fournit une façade stable pour les notifications UI.
 * Il centralise :
 * - les toasts applicatifs (succès/erreur/info) via {@link AppToastProvider},
 * - les toasts de badges via {@link BadgeToastProvider},
 * - le déclenchement des confettis via {@link ConfettiProvider}.
 *
 * Les confettis sont déclenchés depuis cette couche “métier” (et non depuis les composants UI
 * de toasts badges), afin de garantir :
 * - un seul burst pour des événements simultanés (cooldown global),
 * - une cohérence de comportement quel que soit le mode d’affichage des badges.
 *
 * @returns Une API de notifications regroupant les actions disponibles.
 */
export function useNotifications(): NotificationsApi {
    const tWorld = useTranslations("world");
    const { pushToast } = useAppToasts();
    const { pushBadges } = useBadgeToasts();
    const { fire } = useConfetti();

    return useMemo(() => {
        function notifyBadges(
            apiBadges: unknown[],
            options: { celebrate?: boolean } = {},
        ): BadgeToastItem[] {
            if (!apiBadges?.length) return [];

            const items = apiBadges.map(mapApiBadgeToToastItem);
            pushBadges(items);

            if (options.celebrate) {
                // Cooldown dans ConfettiProvider => un seul burst si plusieurs triggers simultanés.
                fire();
            }

            return items;
        }

        function notifySessionSaved(options: NotifySessionSavedOptions = {}) {
            const { celebrate = false, autoCloseMs } = options;

            pushToast({
                kind: "success",
                message: tWorld("toasts.sessionSaved"),
                autoCloseMs,
            });

            if (celebrate) {
                // Cooldown dans ConfettiProvider => absorbe les triggers “au même moment”.
                fire();
            }
        }

        function notifySessionSavedOffline(options: NotifySessionSavedOptions = {}) {
            const { celebrate = false, autoCloseMs } = options;

            pushToast({
                kind: "success",
                message: tWorld("toasts.sessionSavedOffline"),
                autoCloseMs,
            });

            if (celebrate) {
                fire();
            }
        }

        function notifyError(message: string, autoCloseMs?: number) {
            pushToast({ kind: "error", message, autoCloseMs });
        }

        function notifyInfo(message: string, autoCloseMs?: number) {
            pushToast({ kind: "info", message, autoCloseMs });
        }

        return {
            notifyBadges,
            notifySessionSaved,
            notifySessionSavedOffline,
            notifyError,
            notifyInfo,
        };
    }, [fire, pushBadges, pushToast, tWorld]);
}
