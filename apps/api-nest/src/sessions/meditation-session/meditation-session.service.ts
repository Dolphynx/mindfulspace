import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MeditationSessionSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { MeditationTypeDto } from './dto/meditation-type.dto';
import { mapMeditationTypeToDto } from './mapper/meditation-type.mapper';

interface SoundCloudResolveResponse {
    stream_url?: string;
}

/**
 * Service de gestion des séances de méditation.
 *
 * @remarks
 * Cette couche encapsule toute la logique de persistance liée :
 * - à la création de séances de méditation ;
 * - à la récupération d’historiques filtrés (N derniers jours, plage de dates, etc.) ;
 * - au calcul de résumés quotidiens (hier ou date ciblée) ;
 * - à la récupération des types de méditation ;
 * - au filtrage des contenus en fonction du type et de la durée.
 *
 * Les contrôleurs HTTP exposent ces fonctionnalités et peuvent être décorés
 * avec Swagger (`@ApiOperation`, `@ApiResponse`, etc.) afin de générer
 * automatiquement la documentation de l’API.
 */
@Injectable()
export class MeditationSessionService {

  private readonly logger = new Logger(MeditationSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService
  ) {}

  /**
   * Crée une nouvelle séance de méditation pour un utilisateur donné.
   *
   * @param userId Identifiant de l’utilisateur propriétaire de la séance.
   * @param dto Données nécessaires à la création de la séance.
   * @returns La séance de méditation créée.
   */
  async create(userId: string, dto: CreateMeditationSessionDto) {
    // Date logique de la séance -> on fixe l'heure à midi pour éviter les surprises UTC
    const date = new Date(dto.dateSession);
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
   * Calcule un résumé des N derniers jours de méditation pour un utilisateur donné.
   *
   * @remarks
   * Cette méthode généralise l’ancien comportement spécifique aux 7 derniers jours.
   * Elle retourne un tableau minimal pour chaque séance, incluant notamment :
   * - `date` (format `YYYY-MM-DD`) ;
   * - `durationSeconds` ;
   * - `moodAfter` ;
   * - `meditationTypeId`.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param days Nombre de jours à remonter dans le passé.
   * @returns Un tableau contenant, par séance, la durée totale et quelques métadonnées.
   */
  async getLastNDays(userId: string, days: number) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        startedAt: { gte: from },
      },
      orderBy: { startedAt: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.startedAt ? s.startedAt.toISOString().split('T')[0] : null,
      durationSeconds: s.durationSeconds,
      moodAfter: s.moodAfter,
      meditationTypeId: s.meditationTypeId,
    }));
  }

  /**
   * Calcule un résumé des 7 derniers jours de méditation pour un utilisateur donné.
   *
   * @remarks
   * Méthode conservée pour compatibilité interne ; elle délègue vers {@link getLastNDays}.
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un tableau contenant, par séance, la durée totale et quelques métadonnées.
   */
  async getLast7Days(userId: string) {
    return this.getLastNDays(userId, 7);
  }

  /**
   * Récupère les séances de méditation d’un utilisateur dans une plage de dates donnée.
   *
   * @remarks
   * Les dates sont exprimées au format `YYYY-MM-DD`. Si seule la date de début ou
   * de fin est fournie, le filtrage est appliqué dans un seul sens.
   *
   * Le résultat adopte le même format minimaliste que {@link getLastNDays}.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param options Objet contenant `from` et/ou `to` au format `YYYY-MM-DD`.
   * @returns Un tableau de séances filtrées dans la plage indiquée.
   */
  async getSessionsBetweenDates(
    userId: string,
    options: { from?: string; to?: string },
  ) {
    const { from, to } = options;
    const where: Prisma.MeditationSessionWhereInput = {
      userId,
    };

    if (from || to) {
      const startedAt: Prisma.DateTimeFilter = {};

      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          throw new Error('Invalid "from" date format, expected YYYY-MM-DD');
        }
        fromDate.setHours(0, 0, 0, 0);
        startedAt.gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          throw new Error('Invalid "to" date format, expected YYYY-MM-DD');
        }
        // On considère `to` inclusif, donc on filtre jusqu’au début du jour suivant (exclus)
        toDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(toDate);
        nextDay.setDate(toDate.getDate() + 1);
        startedAt.lt = nextDay;
      }

      where.startedAt = startedAt;
    }

    const sessions = await this.prisma.meditationSession.findMany({
      where,
      orderBy: { startedAt: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.startedAt ? s.startedAt.toISOString().split('T')[0] : null,
      durationSeconds: s.durationSeconds,
      moodAfter: s.moodAfter,
      meditationTypeId: s.meditationTypeId,
    }));
  }

  /**
   * Récupère l’historique complet des séances de méditation pour un utilisateur donné.
   *
   * @remarks
   * Le format de retour est identique à celui de {@link getLastNDays},
   * afin de faciliter la consommation côté frontend (graphes, historiques, etc.).
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un tableau de toutes les séances de l’utilisateur concerné.
   */
  async getAllForUser(userId: string) {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.startedAt ? s.startedAt.toISOString().split('T')[0] : null,
      durationSeconds: s.durationSeconds,
      moodAfter: s.moodAfter,
      meditationTypeId: s.meditationTypeId,
    }));
  }

  /**
   * Calcule un résumé des séances de méditation effectuées la veille.
   *
   * @remarks
   * Méthode conservée pour compatibilité interne ; elle délègue vers
   * {@link getDailySummary} sans fournir de date (=> “hier”).
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un objet contenant la durée totale de méditation et
   *          la dernière humeur renseignée après une séance.
   */
  async getYesterdaySummary(userId: string) {
    return this.getDailySummary(userId);
  }

  /**
   * Calcule un résumé quotidien des séances de méditation pour une date donnée
   * ou, par défaut, pour la veille.
   *
   * @remarks
   * - Si `date` est fourni, il doit être au format `YYYY-MM-DD`.
   * - Si `date` est omis, la méthode calcule les bornes de la veille.
   *
   * Le résumé inclut :
   * - la durée cumulée de toutes les séances de la journée ;
   * - la dernière humeur finale enregistrée.
   *
   * @param userId Identifiant de l’utilisateur.
   * @param date Date cible au format `YYYY-MM-DD` (facultative).
   * @returns Un objet `{ durationSeconds, moodAfter }`.
   */
  async getDailySummary(userId: string, date?: string) {
    let dayStart: Date;
    let dayEnd: Date;

    if (date) {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid date format, expected YYYY-MM-DD');
      }
      parsed.setHours(0, 0, 0, 0);

      dayStart = parsed;
      dayEnd = new Date(parsed);
      dayEnd.setDate(dayEnd.getDate() + 1);
    } else {
      // Par défaut : on reprend la logique “hier”
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      dayStart = new Date(today);
      dayStart.setDate(today.getDate() - 1);

      dayEnd = new Date(today);
    }

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    const totalDurationSeconds = sessions.reduce(
      (sum, s) => sum + s.durationSeconds,
      0,
    );

    const lastMoodAfter =
      sessions.length > 0 ? sessions[sessions.length - 1].moodAfter : null;

    return {
      durationSeconds: totalDurationSeconds,
      moodAfter: lastMoodAfter,
    };
  }

  /**
   * Retourne l’ensemble des séances de méditation, triées par date de début
   * décroissante, avec leurs relations de base.
   *
   * @remarks
   * Les entités retournées incluent notamment :
   * - `meditationType`
   * - `meditationContent`
   *
   * Cette méthode est typiquement utilisée dans un contexte d’administration
   * ou pour un listing complet.
   *
   * @returns La liste des séances de méditation enregistrées.
   */
  async findAll() {
    return this.prisma.meditationSession.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        meditationType: true,
        meditationContent: true,
      },
    });
  }

  /**
   * Récupère tous les types de méditation actifs.
   *
   * @remarks
   * - Filtre uniquement les types avec `isActive = true`.
   * - Trie par `sortOrder` croissant.
   * - Mappe les entités Prisma vers des DTO exposables à l’API.
   *
   * @returns Une liste de {@link MeditationTypeDto} destinée au front.
   */
  async getMeditationTypes(): Promise<MeditationTypeDto[]> {
    const types = await this.prisma.meditationType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }],
    });

    return types.map(mapMeditationTypeToDto);
  }

  /**
   * Résout une URL de piste SoundCloud en URL de stream exploitable
   * par un <audio> HTML.
   *
   * @param trackUrl URL publique de la piste SoundCloud
   * @returns URL de stream (avec client_id) ou null en cas d'échec
   */
  private async resolveSoundCloudStream(trackUrl: string): Promise<string | null> {
      const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
      if (!clientId) {
          this.logger.warn(
              'SOUNDCLOUD_CLIENT_ID is not set, cannot resolve SoundCloud URLs.',
          );
          return null;
      }

      try {
          const apiUrl = 'https://api.soundcloud.com/resolve';

          const response = await firstValueFrom(
              this.http.get<SoundCloudResolveResponse>(apiUrl, {
                  params: {
                      url: trackUrl,
                      client_id: clientId,
                  },
              }),
          );

          const data = response.data;

          if (!data || typeof data.stream_url !== 'string') {
              this.logger.warn(
                  `SoundCloud resolve did not return a valid stream_url for ${trackUrl}`,
              );
              return null;
          }

          const streamUrl: string = data.stream_url;

          return `${streamUrl}?client_id=${clientId}`;
      } catch (error) {
          this.logger.error(
              `Error while resolving SoundCloud URL ${trackUrl}: ${String(error)}`,
          );
          return null;
      }
  }


    /**
   * Récupère les contenus de méditation filtrés par type et,
   * éventuellement, par durée cible.
   *
   * @remarks
   * Règles de filtrage :
   * - `meditationTypeId` est obligatoire (sinon une erreur est levée).
   * - `isActive` doit être vrai.
   * - `defaultMeditationTypeId` doit correspondre au type fourni.
   * - Si `durationSeconds` est fourni et > 0, on applique une combinaison
   *   de règles sur `minDurationSeconds` et `maxDurationSeconds` :
   *   - cas 1 : `min <= duration <= max`
   *   - cas 2 : `min` null, `max >= duration`
   *   - cas 3 : `min <= duration`, `max` null
   *   - cas 4 : `min` null, `max` null (aucune contrainte)
   *
   * Le résultat est réduit à ce que le front attend :
   * un sous-ensemble de champs plus un champ `durationSeconds`
   * basé sur `defaultDurationSeconds`.
   *
   * @param meditationTypeId Identifiant du type de méditation à filtrer.
   * @param durationSeconds Durée cible en secondes (facultative).
   * @returns La liste des contenus de méditation correspondant aux critères.
   * @throws Error Si `meditationTypeId` est vide ou non fourni.
   */
  async getMeditationContents(
    meditationTypeId: string,
    durationSeconds?: number,
  ) {
    if (!meditationTypeId) {
      throw new Error('meditationTypeId is required');
    }

    const where: Prisma.MeditationContentWhereInput = {
      isActive: true,
      defaultMeditationTypeId: meditationTypeId,
    };

    // Si une durée est fournie, on filtre en fonction de min/maxDurationSeconds
    if (durationSeconds && durationSeconds > 0) {
      where.OR = [
        // cas “entre min et max”
        {
          minDurationSeconds: { lte: durationSeconds },
          maxDurationSeconds: { gte: durationSeconds },
        },
        // cas “min null, max >= duration”
        {
          minDurationSeconds: null,
          maxDurationSeconds: { gte: durationSeconds },
        },
        // cas “min <= duration, max null”
        {
          minDurationSeconds: { lte: durationSeconds },
          maxDurationSeconds: null,
        },
        // cas “aucune contrainte de min/max”
        {
          minDurationSeconds: null,
          maxDurationSeconds: null,
        },
      ];
    }

    const items = await this.prisma.meditationContent.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        mode: true,
        defaultDurationSeconds: true,
        minDurationSeconds: true,
        maxDurationSeconds: true,
        defaultMeditationTypeId: true,
        isPremium: true,
        mediaUrl: true,
        soundcloudUrl: true, // ⬅️ nouveau
      },
    });

    // On résout éventuellement les URLs SoundCloud pour obtenir un vrai mediaUrl
    const resolved = await Promise.all(
      items.map(async (c) => {
        let mediaUrl = c.mediaUrl;

        if (!mediaUrl && c.soundcloudUrl) {
          const scStream = await this.resolveSoundCloudStream(c.soundcloudUrl);
          mediaUrl = scStream ?? null;
        }

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          mode: c.mode,
          durationSeconds: c.defaultDurationSeconds,
          meditationTypeId: c.defaultMeditationTypeId,
          isPremium: c.isPremium,
          mediaUrl, // déjà “prêt à jouer” (local ou SoundCloud)
        };
      }),
    );

    return resolved;
  }
}
