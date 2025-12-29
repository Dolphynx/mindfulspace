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
 * Format minimal renvoyé pour une session de méditation dans les historiques.
 */
type MeditationHistoryItem = {
  date: string | null;
  durationSeconds: number;
  moodAfter: number | null;
  meditationTypeId: string;
};

/**
 * Format renvoyé au client pour un contenu de méditation.
 */
export type MeditationContentDto = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  durationSeconds: number;
  meditationTypeId: string;
  isPremium: boolean;
  mediaUrl: string | null;
};

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
   * @returns La séance créée (modèle Prisma).
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
  async getLastNDays(userId: string, days: number): Promise<MeditationHistoryItem[]> {
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
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un tableau minimal par séance.
   */
  async getLast7Days(userId: string): Promise<MeditationHistoryItem[]> {
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
  ): Promise<MeditationHistoryItem[]> {
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
  async getAllForUser(userId: string): Promise<MeditationHistoryItem[]> {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId },
      orderBy: { startedAt: "asc" },
    });

    return sessions.map(this.toHistoryItem);
  }

  /**
   * Compat : délègue vers {@link getDailySummary} sans date (veille).
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Résumé du jour précédent.
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
  async getDailySummary(userId: string, date?: string): Promise<{
    durationSeconds: number;
    moodAfter: number | null;
  }> {
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
   *
   * @returns Liste complète des séances avec leurs relations.
   */
  async findAll() {
    return this.prisma.meditationSession.findMany({
      orderBy: { startedAt: "desc" },
      include: { meditationType: true, meditationContent: true },
    });
  }

  /**
   * Retourne les types de méditation actifs.
   *
   * @returns Liste triée des types actifs.
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
   * - si un lien direct (`mediaUrl`) est renseigné en base de données, il est utilisé ;
   * - sinon, si `externalAudioProvider/externalAudioRef` sont renseignés, l’URL est résolue
   *   via {@link MeditationAudioResolverService}.
   *
   * Contrat important (optimisation + tests unitaires) :
   * - si `mediaUrl` est déjà présent, le resolver n’est pas appelé ;
   * - si `mediaUrl` est absent et que `provider/ref` sont absents, le resolver n’est pas appelé.
   *
   * @param meditationTypeId Identifiant de type.
   * @param durationSeconds Durée cible (optionnelle).
   * @returns Contenus compatibles.
   */
  async getMeditationContents(
    meditationTypeId: string,
    durationSeconds?: number,
  ): Promise<MeditationContentDto[]> {
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
         * Champs multi-provider (présents dans Prisma).
         */
        externalAudioProvider: true,
        externalAudioRef: true,
      },
    });

    const resolved = await Promise.all(
      items.map(async (c): Promise<MeditationContentDto> => {
        const directUrl = (c.mediaUrl ?? "").trim();

        /**
         * Si un lien direct est déjà disponible, il est renvoyé tel quel
         * et aucun mécanisme de résolution externe n’est déclenché.
         */
        if (directUrl.length > 0) {
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            mode: c.mode,
            durationSeconds: c.defaultDurationSeconds ?? 0,
            meditationTypeId: c.defaultMeditationTypeId,
            isPremium: c.isPremium,
            mediaUrl: c.mediaUrl,
          };
        }

        const provider =
          (c.externalAudioProvider as ExternalAudioProvider | null) ?? null;
        const ref = (c.externalAudioRef ?? "").trim();

        /**
         * Si aucune information externe n’est fournie, on conserve `null`
         * et on n’appelle pas le resolver.
         */
        if (!provider || ref.length === 0) {
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            mode: c.mode,
            durationSeconds: c.defaultDurationSeconds ?? 0,
            meditationTypeId: c.defaultMeditationTypeId,
            isPremium: c.isPremium,
            mediaUrl: null,
          };
        }

        /**
         * Résolution de l’URL finale uniquement lorsque nécessaire.
         */
        const mediaUrl = await this.audioResolver.resolveFromContent({
          mediaUrl: null,
          externalAudioProvider: provider,
          externalAudioRef: ref,
        });

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          mode: c.mode,
          durationSeconds: c.defaultDurationSeconds ?? 0,
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
   *
   * @param s Session partielle.
   * @returns Item d’historique.
   */
  private readonly toHistoryItem = (s: {
    startedAt: Date | null;
    durationSeconds: number;
    moodAfter: number | null;
    meditationTypeId: string;
  }): MeditationHistoryItem => ({
    date: s.startedAt ? s.startedAt.toISOString().split("T")[0] : null,
    durationSeconds: s.durationSeconds,
    moodAfter: s.moodAfter,
    meditationTypeId: s.meditationTypeId,
  });

  /**
   * Calcule les bornes [start, end) d’un jour (date fournie ou veille).
   *
   * @param date Date `YYYY-MM-DD` optionnelle.
   * @returns Bornes du jour ciblé.
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
   *
   * @param dateStr Date en chaîne.
   * @param fieldName Nom du champ pour la construction du message d’erreur.
   * @returns Date parsée.
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
   *
   * @param dateStr Date en chaîne.
   * @param fieldName Nom du champ pour la construction du message d’erreur.
   * @returns La chaîne validée.
   */
  private assertDayStringOrThrow(dateStr: string, fieldName: string): string {
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    if (!isValid) {
      throw new BadRequestException(ERRORS.DAY_FORMAT(fieldName));
    }
    return dateStr;
  }
}
