import { ApiProperty } from "@nestjs/swagger";

/**
 * @file world-overview.dto.ts
 * @description
 * DTOs de sortie pour l'endpoint agrégé "World Overview".
 */

/**
 * KPIs du snapshot transversal affiché en haut du dashboard.
 */
export class WorldSnapshotDto {
  @ApiProperty({ description: "Minutes totales sur la semaine courante (lun->maintenant).", example: 80 })
  weekMinutes!: number;

  @ApiProperty({ description: "Score de bien-être (0-100) calculé à partir des métriques.", example: 72 })
  wellbeingScore!: number;

  @ApiProperty({ description: "Streak (jours consécutifs) de méditation (0 si aucune session).", example: 5 })
  meditationStreakDays!: number;
}

/**
 * KPIs pour le domaine Sleep.
 */
export class WorldSleepKpisDto {
  @ApiProperty({ description: "Durée moyenne sur la période, en minutes.", example: 465 })
  avgDurationMinutes!: number;

  @ApiProperty({ description: "Qualité moyenne sur la période (1-5). Null si aucune donnée.", example: 4 })
  avgQuality!: number | null;

  @ApiProperty({ description: "Dernière nuit encodée : durée en minutes. Null si aucune donnée.", example: 450 })
  lastNightMinutes!: number | null;

  @ApiProperty({ description: "Dernière nuit encodée : qualité (1-5). Null si aucune donnée.", example: 4 })
  lastNightQuality!: number | null;
}

/**
 * KPIs pour le domaine Meditation.
 */
export class WorldMeditationKpisDto {
  @ApiProperty({ description: "Nombre de séances sur les 7 derniers jours.", example: 6 })
  last7DaysSessions!: number;

  @ApiProperty({ description: "Minutes totales sur les 7 derniers jours.", example: 80 })
  last7DaysMinutes!: number;

  @ApiProperty({ description: "Humeur moyenne (moodAfter) sur les 7 derniers jours. Null si absente.", example: 4 })
  avgMoodAfter!: number | null;
}

/**
 * KPIs pour le domaine Exercise.
 */
export class WorldExerciseKpisDto {
  @ApiProperty({ description: "Nombre de séances sur la semaine courante (lun->maintenant).", example: 2 })
  weekSessions!: number;

  @ApiProperty({
    description:
      "Nombre d'exercices distincts réalisés sur la semaine (proxy 'objectifs' pour la carte).",
    example: 3,
  })
  weekDistinctExercises!: number;

  @ApiProperty({ description: "Qualité moyenne (1-5) sur la semaine. Null si absente.", example: 4 })
  avgQuality!: number | null;
}

/**
 * Payload complet pour l'overview du World Hub.
 */
export class WorldOverviewDto {
  @ApiProperty({ type: WorldSnapshotDto })
  snapshot!: WorldSnapshotDto;

  @ApiProperty({ type: WorldSleepKpisDto })
  sleep!: WorldSleepKpisDto;

  @ApiProperty({ type: WorldMeditationKpisDto })
  meditation!: WorldMeditationKpisDto;

  @ApiProperty({ type: WorldExerciseKpisDto })
  exercise!: WorldExerciseKpisDto;
}
