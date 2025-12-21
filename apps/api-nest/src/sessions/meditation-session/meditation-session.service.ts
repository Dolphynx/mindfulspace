import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { MeditationSessionSource, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateMeditationSessionDto } from "./dto/meditation-session.dto";
import { MeditationTypeDto } from "./dto/meditation-type.dto";
import { mapMeditationTypeToDto } from "./mapper/meditation-type.mapper";
import { ERRORS } from "../../common/errors/errors";

interface SoundCloudResolveResponse {
  stream_url?: string;
}

/**
 * Service de gestion des séances de méditation.
 *
 * @remarks
 * Cette couche encapsule :
 * - la création de séances ;
 * - la récupération d’historiques filtrés ;
 * - le calcul de résumés quotidiens ;
 * - la récupération des types et contenus de méditation.
 */
@Injectable()
export class MeditationSessionService {
  private readonly logger = new Logger(MeditationSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
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

    const durationSeconds = sessions.reduce(
      (sum, s) => sum + s.durationSeconds,
      0,
    );
    const moodAfter =
      sessions.length > 0 ? sessions[sessions.length - 1].moodAfter : null;

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
   * @param meditationTypeId Identifiant de type.
   * @param durationSeconds Durée cible (optionnelle).
   * @returns Contenus compatibles.
   */
  async getMeditationContents(
    meditationTypeId: string,
    durationSeconds?: number,
  ) {
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
        soundcloudUrl: true,
      },
    });

    const resolved = await Promise.all(
      items.map(async (c) => {
        let mediaUrl = c.mediaUrl;

        if (!mediaUrl && c.soundcloudUrl) {
          mediaUrl = (await this.resolveSoundCloudStream(c.soundcloudUrl)) ?? null;
        }

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
   * Résout une URL SoundCloud en URL de stream.
   */
  private async resolveSoundCloudStream(trackUrl: string): Promise<string | null> {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) {
      this.logger.warn(
        "SOUNDCLOUD_CLIENT_ID is not set, cannot resolve SoundCloud URLs.",
      );
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<SoundCloudResolveResponse>(
          "https://api.soundcloud.com/resolve",
          {
            params: { url: trackUrl, client_id: clientId },
          },
        ),
      );

      const data = response.data;
      if (!data || typeof data.stream_url !== "string") {
        this.logger.warn(
          `SoundCloud resolve did not return a valid stream_url for ${trackUrl}`,
        );
        return null;
      }

      return `${data.stream_url}?client_id=${clientId}`;
    } catch (error) {
      this.logger.error(
        `Error while resolving SoundCloud URL ${trackUrl}: ${String(error)}`,
      );
      return null;
    }
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
