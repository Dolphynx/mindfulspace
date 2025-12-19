import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorldOverviewDto } from "./dto/world-overview.dto";

/**
 * @file world-overview.service.ts
 * @description
 * Service de calcul des métriques agrégées affichées sur la SPA "world-v2".
 */

@Injectable()
export class WorldOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule le début de semaine ISO (lundi 00:00) en heure locale serveur.
   *
   * @param now Date de référence.
   * @returns Date correspondant au lundi 00:00 de la semaine courante.
   */
  private getStartOfIsoWeek(now: Date): Date {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0=dim,1=lun,...6=sam
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diffToMonday);
    return d;
  }

  /**
   * Calcule le début de journée (00:00).
   *
   * @param now Date de référence.
   * @returns Début de journée.
   */
  private startOfDay(now: Date): Date {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Calcule une streak en jours consécutifs à partir d'une liste de dates (YYYY-MM-DD) triées décroissantes.
   *
   * @param isoDates Jours (format YYYY-MM-DD) triés du plus récent au plus ancien.
   * @returns Nombre de jours consécutifs à partir du jour le plus récent.
   */
  private computeStreakDays(isoDates: string[]): number {
    if (isoDates.length === 0) return 0;

    let streak = 1;
    let prev = new Date(isoDates[0]);
    prev.setHours(0, 0, 0, 0);

    for (let i = 1; i < isoDates.length; i++) {
      const cur = new Date(isoDates[i]);
      cur.setHours(0, 0, 0, 0);

      const expected = new Date(prev);
      expected.setDate(expected.getDate() - 1);

      if (cur.getTime() === expected.getTime()) {
        streak += 1;
        prev = cur;
        continue;
      }

      break;
    }

    return streak;
  }

  /**
   * Normalise une valeur sur 100.
   *
   * @param value Valeur courante.
   * @param target Valeur cible (>=1).
   * @returns Score 0..100.
   */
  private scoreByTarget(value: number, target: number): number {
    if (target <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, value / target));
    return Math.round(ratio * 100);
  }

  /**
   * Calcule un score de bien-être simple et stable (0..100) à partir :
   * - Sleep : qualité (1..5) + durée moyenne (cible 8h)
   * - Meditation : minutes semaine (cible 70)
   * - Exercise : séances semaine (cible 3)
   *
   * @param params Paramètres déjà agrégés.
   * @returns Score 0..100.
   */
  private computeWellbeingScore(params: {
    sleepAvgMinutes: number;
    sleepAvgQuality: number | null;
    meditationWeekMinutes: number;
    exerciseWeekSessions: number;
  }): number {
    const sleepDurationScore = this.scoreByTarget(params.sleepAvgMinutes, 8 * 60);
    const sleepQualityScore =
      params.sleepAvgQuality == null ? 50 : Math.round((Math.max(1, Math.min(5, params.sleepAvgQuality)) / 5) * 100);

    const meditationScore = this.scoreByTarget(params.meditationWeekMinutes, 70);
    const exerciseScore = this.scoreByTarget(params.exerciseWeekSessions, 3);

    const avg = (sleepDurationScore + sleepQualityScore + meditationScore + exerciseScore) / 4;
    return Math.round(avg);
  }

  /**
   * Retourne le payload agrégé consommé par la page SPA "world-v2".
   *
   * @param userId Identifiant de l'utilisateur courant.
   * @returns Objet agrégé (snapshot + KPIs par domaine).
   */
  async getOverviewForUser(userId: string): Promise<WorldOverviewDto> {
    const now = new Date();
    const startOfWeek = this.getStartOfIsoWeek(now);
    const startOfToday = this.startOfDay(now);

    const last7DaysStart = new Date(startOfToday);
    last7DaysStart.setDate(last7DaysStart.getDate() - 6); // inclusif : J-6 .. J

    const [sleepSessions, meditationSessions7d, meditationSessionsWeek, exerciseSessionsWeek] = await Promise.all([
      this.prisma.sleepSession.findMany({
        where: { userId, dateSession: { gte: startOfWeek } },
        orderBy: { dateSession: "desc" },
      }),
      this.prisma.meditationSession.findMany({
        where: { userId, startedAt: { gte: last7DaysStart } },
        orderBy: { startedAt: "desc" },
        select: { startedAt: true, durationSeconds: true, moodAfter: true },
      }),
      this.prisma.meditationSession.findMany({
        where: { userId, startedAt: { gte: startOfWeek } },
        select: { durationSeconds: true },
      }),
      this.prisma.exerciceSession.findMany({
        where: { userId, dateSession: { gte: startOfWeek } },
        orderBy: { dateSession: "desc" },
        include: { exerciceSerie: { select: { exerciceContentId: true } } },
      }),
    ]);

    const sleepAvgMinutes =
      sleepSessions.length === 0
        ? 0
        : Math.round((sleepSessions.reduce((sum, s) => sum + s.hours * 60, 0) / sleepSessions.length) || 0);

    const sleepQualities = sleepSessions.map((s) => s.quality).filter((q): q is number => typeof q === "number");
    const sleepAvgQuality = sleepQualities.length === 0 ? null : Math.round(sleepQualities.reduce((a, b) => a + b, 0) / sleepQualities.length);

    const lastNight = sleepSessions[0] ?? null;
    const lastNightMinutes = lastNight ? lastNight.hours * 60 : null;
    const lastNightQuality = lastNight?.quality ?? null;

    const meditation7dSessions = meditationSessions7d.length;
    const meditation7dMinutes = Math.round(meditationSessions7d.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

    const moods = meditationSessions7d.map((s) => s.moodAfter).filter((m): m is number => typeof m === "number");
    const avgMoodAfter = moods.length === 0 ? null : Math.round(moods.reduce((a, b) => a + b, 0) / moods.length);

    const meditationWeekMinutes = Math.round(meditationSessionsWeek.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

    const meditationDays = Array.from(
      new Set(
        meditationSessions7d
          .map((s) => (s.startedAt ? s.startedAt.toISOString().split("T")[0] : null))
          .filter((d): d is string => !!d),
      ),
    ).sort((a, b) => (a > b ? -1 : 1));

    const meditationStreakDays = this.computeStreakDays(meditationDays);

    const exerciseWeekSessions = exerciseSessionsWeek.length;

    const distinctExercises = new Set<string>();
    for (const sess of exerciseSessionsWeek) {
      for (const serie of sess.exerciceSerie) distinctExercises.add(serie.exerciceContentId);
    }

    const exerciseQualities = exerciseSessionsWeek.map((s) => s.quality).filter((q): q is number => typeof q === "number");
    const exerciseAvgQuality = exerciseQualities.length === 0 ? null : Math.round(exerciseQualities.reduce((a, b) => a + b, 0) / exerciseQualities.length);

    const wellbeingScore = this.computeWellbeingScore({
      sleepAvgMinutes,
      sleepAvgQuality,
      meditationWeekMinutes,
      exerciseWeekSessions,
    });

    return {
      snapshot: {
        weekMinutes: meditationWeekMinutes,
        wellbeingScore,
        meditationStreakDays,
      },
      sleep: {
        avgDurationMinutes: sleepAvgMinutes,
        avgQuality: sleepAvgQuality,
        lastNightMinutes,
        lastNightQuality,
      },
      meditation: {
        last7DaysSessions: meditation7dSessions,
        last7DaysMinutes: meditation7dMinutes,
        avgMoodAfter,
      },
      exercise: {
        weekSessions: exerciseWeekSessions,
        weekDistinctExercises: distinctExercises.size,
        avgQuality: exerciseAvgQuality,
      },
    };
  }
}
