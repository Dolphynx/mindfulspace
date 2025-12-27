import { BadRequestException, Injectable } from "@nestjs/common";
import { MeditationSessionSource, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateMeditationSessionDto } from "./dto/meditation-session.dto";
import { MeditationTypeDto } from "./dto/meditation-type.dto";
import { mapMeditationTypeToDto } from "./mapper/meditation-type.mapper";
import { ERRORS } from "../../common/errors/errors";

import { MeditationAudioResolverService } from "./audio/meditation-audio-resolver.service";
import { ExternalAudioProvider } from "./audio/external-audio-provider";

/**
 * Service de gestion des séances de méditation.
 *
 * @remarks
 * Cette couche encapsule :
 * - la création de séances ;
 * - la récupération d’historiques filtrés ;
 * - le calcul de résumés quotidiens ;
 * - la récupération des types et contenus de méditation.
 *
 * La résolution des médias audio externes (Audius, SoundCloud, etc.) est déléguée à
 * {@link MeditationAudioResolverService}.
 */
@Injectable()
export class MeditationSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audioResolver: MeditationAudioResolverService,
  ) {}

  /**
   * Crée une séance de méditation.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param dto Données de création.
   * @returns La séance créée.
   */
  async create(userId: string, dto: CreateMeditationSessionDto) {
    this.assertDayStringOrThrow(dto.dateSession, "dateSession");

    const date = this.parseDateOrThrow(dto.dateSession, "dateSession");
    date.setHours(12, 0, 0, 0);

    const startedAt = date;
    const endedAt = new Date(startedAt.getTime() + dto.durationSeconds * 1000);

    const source = dto.source ?? MeditationSessionSource.MANUAL;

    return this.prisma.meditationSession.create({
      data: {
        userId,
        source,
        meditationTypeId: dto.meditationTypeId,
        meditationContentId: dto.meditationContentId ?? null,
        startedAt,
        endedAt,
        durationSeconds: dto.durationSeconds,
        moodBefore: dto.moodBefore ?? null,
        moodAfter: dto.moodAfter ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  /**
   * Retourne les séances des N derniers jours.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param days Nombre de jours.
   * @returns Un tableau minimal par séance.
   */
  async getLastNDays(userId: string, days: number) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId, startedAt: { gte: from } },
      orderBy: { startedAt: "asc" },
    });

    return sessions.map(this.toHistoryItem);
  }

  /**
   * Compat : délègue vers {@link getLastNDays} avec 7 jours.
   */
  async getLast7Days(userId: string) {
    return this.getLastNDays(userId, 7);
  }

  /**
   * Retourne les séances dans une plage de dates.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param options Plage `from/to` (format `YYYY-MM-DD`).
   * @returns Un tableau minimal par séance.
   */
  async getSessionsBetweenDates(
    userId: string,
    options: { from?: string; to?: string },
  ) {
    const { from, to } = options;

    const where: Prisma.MeditationSessionWhereInput = { userId };

    if (from || to) {
      const startedAt: Prisma.DateTimeFilter = {};

      if (from) {
        this.assertDayStringOrThrow(from, "from");
        const fromDate = this.parseDateOrThrow(from, "from");
        fromDate.setHours(0, 0, 0, 0);
        startedAt.gte = fromDate;
      }

      if (to) {
        this.assertDayStringOrThrow(to, "to");
        const toDate = this.parseDateOrThrow(to, "to");
        toDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(toDate);
        nextDay.setDate(toDate.getDate() + 1);
        startedAt.lt = nextDay;
      }

      where.startedAt = startedAt;
    }

    const sessions = await this.prisma.meditationSession.findMany({
      where,
      orderBy: { startedAt: "asc" },
    });

    return sessions.map(this.toHistoryItem);
  }

  /**
   * Retourne l’historique complet des séances.
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un tableau minimal par séance.
   */
  async getAllForUser(userId: string) {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId },
      orderBy: { startedAt: "asc" },
    });

    return sessions.map(this.toHistoryItem);
  }

  /**
   * Compat : délègue vers {@link getDailySummary} sans date (veille).
   */
  async getYesterdaySummary(userId: string) {
    return this.getDailySummary(userId);
  }

  /**
   * Calcule un résumé quotidien (date fournie ou veille).
   *
   * @param userId Identifiant de l’utilisateur.
   * @param date Date cible `YYYY-MM-DD` (optionnelle).
   * @returns `{ durationSeconds, moodAfter }`.
   */
  async getDailySummary(userId: string, date?: string) {
    const { dayStart, dayEnd } = this.getDayBounds(date);

    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId, startedAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { startedAt: "asc" },
    });

    const durationSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const moodAfter = sessions.length > 0 ? sessions[sessions.length - 1].moodAfter : null;

    return { durationSeconds, moodAfter };
  }

  /**
   * Retourne toutes les séances (admin/back-office).
   */
  async findAll() {
    return this.prisma.meditationSession.findMany({
      orderBy: { startedAt: "desc" },
      include: { meditationType: true, meditationContent: true },
    });
  }

  /**
   * Retourne les types de méditation actifs.
   */
  async getMeditationTypes(): Promise<MeditationTypeDto[]> {
    const types = await this.prisma.meditationType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });

    return types.map(mapMeditationTypeToDto);
  }

  /**
   * Retourne les contenus filtrés par type et éventuellement par durée.
   *
   * @remarks
   * La valeur `mediaUrl` renvoyée au client correspond à l’URL finale consommable :
   * - si un lien direct (`mediaUrl`) est renseigné en DB, il est utilisé ;
   * - sinon, si `externalAudioProvider/externalAudioRef` sont renseignés, l’URL est résolue
   *   via {@link MeditationAudioResolverService}.
   *
   * @param meditationTypeId Identifiant de type.
   * @param durationSeconds Durée cible (optionnelle).
   * @returns Contenus compatibles.
   */
  async getMeditationContents(meditationTypeId: string, durationSeconds?: number) {
    if (!meditationTypeId) {
      throw new BadRequestException(ERRORS.REQUIRED("meditationTypeId"));
    }

    const where: Prisma.MeditationContentWhereInput = {
      isActive: true,
      defaultMeditationTypeId: meditationTypeId,
    };

    if (durationSeconds && durationSeconds > 0) {
      where.OR = [
        {
          minDurationSeconds: { lte: durationSeconds },
          maxDurationSeconds: { gte: durationSeconds },
        },
        { minDurationSeconds: null, maxDurationSeconds: { gte: durationSeconds } },
        { minDurationSeconds: { lte: durationSeconds }, maxDurationSeconds: null },
        { minDurationSeconds: null, maxDurationSeconds: null },
      ];
    }

    const items = await this.prisma.meditationContent.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        mode: true,
        defaultDurationSeconds: true,
        defaultMeditationTypeId: true,
        isPremium: true,
        mediaUrl: true,

        /**
         * Champs multi-provider (à ajouter dans Prisma).
         */
        externalAudioProvider: true,
        externalAudioRef: true,
      },
    });

    const resolved = await Promise.all(
      items.map(async (c) => {
        const mediaUrl = await this.audioResolver.resolveFromContent({
          mediaUrl: c.mediaUrl,
          externalAudioProvider: (c.externalAudioProvider as ExternalAudioProvider | null) ?? null,
          externalAudioRef: c.externalAudioRef,
        });

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          mode: c.mode,
          durationSeconds: c.defaultDurationSeconds,
          meditationTypeId: c.defaultMeditationTypeId,
          isPremium: c.isPremium,
          mediaUrl,
        };
      }),
    );

    return resolved;
  }

  /**
   * Transforme une session Prisma vers un item d’historique minimal.
   */
  private readonly toHistoryItem = (s: {
    startedAt: Date | null;
    durationSeconds: number;
    moodAfter: number | null;
    meditationTypeId: string;
  }) => ({
    date: s.startedAt ? s.startedAt.toISOString().split("T")[0] : null,
    durationSeconds: s.durationSeconds,
    moodAfter: s.moodAfter,
    meditationTypeId: s.meditationTypeId,
  });

  /**
   * Calcule les bornes [start, end) d’un jour (date fournie ou veille).
   */
  private getDayBounds(date?: string): { dayStart: Date; dayEnd: Date } {
    if (date) {
      this.assertDayStringOrThrow(date, "date");
      const parsed = this.parseDateOrThrow(date, "date");
      parsed.setHours(0, 0, 0, 0);

      const dayStart = parsed;
      const dayEnd = new Date(parsed);
      dayEnd.setDate(dayEnd.getDate() + 1);

      return { dayStart, dayEnd };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - 1);

    const dayEnd = new Date(today);

    return { dayStart, dayEnd };
  }

  /**
   * Parse une date via `Date` et lève une 400 si invalide.
   */
  private parseDateOrThrow(dateStr: string, fieldName: string): Date {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(ERRORS.DAY_INVALID(fieldName));
    }
    return date;
  }

  /**
   * Valide une date "jour" strictement au format `YYYY-MM-DD`.
   */
  private assertDayStringOrThrow(dateStr: string, fieldName: string): string {
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    if (!isValid) {
      throw new BadRequestException(ERRORS.DAY_FORMAT(fieldName));
    }
    return dateStr;
  }
}
