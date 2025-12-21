/**
 * @file meditationHistory.ts
 * @description
 * Fonctions pures de préparation des données pour l’historique de méditation.
 *
 * @remarks
 * Ce module ne dépend pas de React et ne contient aucun effet de bord.
 * Il centralise le regroupement des séances, les agrégats (minutes, compte, humeur moyenne),
 * et les structures utiles au rendu.
 */

import { getMood } from "@/lib";
import type {
    MeditationSession,
    MeditationTypeItem,
    MeditationErrorType,
} from "@/hooks/useMeditationSessions";

/**
 * Groupe de séances de méditation pour une date donnée.
 */
export type GroupedMeditationDay = {
    /**
     * Date du groupe, telle que fournie par l’API (format dépendant du backend).
     */
    date: string;

    /**
     * Minutes totales de la journée (arrondies).
     */
    totalMinutes: number;

    /**
     * Séances de la journée.
     */
    items: MeditationSession[];
};

/**
 * Modèle de données consommé par la carte d’historique.
 */
export type MeditationHistoryModel = {
    /**
     * Groupes de séances, limités aux 7 derniers jours de pratique (au sens “7 dates max”).
     */
    grouped: GroupedMeditationDay[];

    /**
     * Minutes totales sur la fenêtre retenue (7 derniers jours de pratique).
     */
    totalWeekMinutes: number;

    /**
     * Nombre total de séances sur la fenêtre retenue.
     */
    totalSessionsCount: number;

    /**
     * Humeur moyenne (post-séance) sur la fenêtre retenue, ou `null` si aucune humeur disponible.
     */
    averageMood: ReturnType<typeof getMood> | null;

    /**
     * Message d’erreur de chargement localisé, ou `null`.
     */
    loadError: string | null;

    /**
     * Indique si la carte dispose de données exploitables pour le rendu détaillé.
     */
    hasData: boolean;

    /**
     * Index typeId -> type pour retrouver les slugs et libellés.
     */
    typeMap: Record<string, MeditationTypeItem>;
};

/**
 * Regroupe les séances par date et calcule le total de minutes par jour.
 *
 * @param sessions Liste brute des séances provenant de l’API.
 * @returns Liste de groupes triés par date croissante.
 */
export function groupMeditationSessionsByDate(
    sessions: MeditationSession[],
): GroupedMeditationDay[] {
    const byDate = new Map<string, MeditationSession[]>();

    for (const s of sessions) {
        const list = byDate.get(s.date) ?? [];
        list.push(s);
        byDate.set(s.date, list);
    }

    return Array.from(byDate.entries())
        .sort(([d1], [d2]) => d1.localeCompare(d2))
        .map(([date, items]) => {
            const totalSeconds = items.reduce((sum, s) => sum + s.durationSeconds, 0);

            return {
                date,
                totalMinutes: Math.round(totalSeconds / 60),
                items,
            };
        });
}

/**
 * Construit le modèle de données de la carte d’historique, incluant agrégats et regroupements.
 *
 * @param params Paramètres d’entrée (séances, états, types et fonction de traduction).
 * @returns Modèle préparé pour le rendu.
 */
export function computeMeditationHistoryModel(params: {
    /**
     * Liste brute des séances récupérées via l’API.
     */
    sessions: MeditationSession[];

    /**
     * Indique si le chargement est en cours.
     */
    loading: boolean;

    /**
     * Type d’erreur éventuelle rencontrée lors du chargement.
     */
    errorType: MeditationErrorType;

    /**
     * Liste des types de méditation (pour libellés).
     */
    types: MeditationTypeItem[];

    /**
     * Fonction de traduction (namespace `domainMeditation` attendu).
     */
    t: (k: string) => string;
}): MeditationHistoryModel {
    const { sessions, loading, errorType, types, t } = params;

    const typeMap: Record<string, MeditationTypeItem> = Object.fromEntries(
        types.map((type) => [type.id, type]),
    );

    const loadError = errorType === "load" ? t("errors.loadSessions") : null;

    const groupedAll = groupMeditationSessionsByDate(sessions);

    /**
     * Limitation UI : conserver au plus 7 jours (7 dates distinctes) dans le rendu.
     */
    const grouped = groupedAll.slice(-7);

    const sessionsForSummary = grouped.flatMap((g) => g.items);

    const totalWeekMinutes = Math.round(
        sessionsForSummary.reduce((sum, s) => sum + s.durationSeconds, 0) / 60,
    );

    const totalSessionsCount = sessionsForSummary.length;

    const moodValues = sessionsForSummary
        .map((s) => s.moodAfter)
        .filter((value): value is number => value != null);

    const averageMoodValue =
        moodValues.length > 0
            ? Math.round(moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length)
            : null;

    const averageMood = averageMoodValue != null ? getMood(averageMoodValue) : null;

    const hasData = !loading && totalSessionsCount > 0 && !loadError;

    return {
        grouped,
        totalWeekMinutes,
        totalSessionsCount,
        averageMood,
        loadError,
        hasData,
        typeMap,
    };
}
