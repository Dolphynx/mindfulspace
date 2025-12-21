/**
 * @file worldOverview.ts
 * @description
 * Client API pour récupérer les métriques agrégées du World Hub.
 */

import { apiFetch } from "@/lib/api/client";

/**
 * DTO renvoyé par l'endpoint `/me/world/overview`.
 */
export type WorldOverviewDto = {
    snapshot: {
        weekMinutes: number;
        wellbeingScore: number;
        meditationStreakDays: number;
    };
    sleep: {
        avgDurationMinutes: number;
        avgQuality: number | null;
        lastNightMinutes: number | null;
        lastNightQuality: number | null;
    };
    meditation: {
        last7DaysSessions: number;
        last7DaysMinutes: number;
        avgMoodAfter: number | null;
    };
    exercise: {
        weekSessions: number;
        weekDistinctExercises: number;
        avgQuality: number | null;
    };
};

/**
 * Récupère le payload agrégé pour l'utilisateur courant.
 *
 * @returns DTO agrégé.
 */
export async function getWorldOverview(): Promise<WorldOverviewDto> {
    const res = await apiFetch("/me/world/overview", {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch world overview (${res.status})`);
    }

    return (await res.json()) as WorldOverviewDto;
}
