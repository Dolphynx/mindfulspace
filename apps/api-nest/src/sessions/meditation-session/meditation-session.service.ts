import { Injectable } from '@nestjs/common';
import { MeditationSessionSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { MeditationTypeDto } from './dto/meditation-type.dto';
import { mapMeditationTypeToDto } from './mapper/meditation-type.mapper';

/**
 * Service de gestion des séances de méditation.
 *
 * @remarks
 * Cette couche encapsule toute la logique de persistance liée :
 * - à la création de séances de méditation ;
 * - à la récupération d’historiques (7 derniers jours, hier, etc.) ;
 * - à la récupération des types de méditation ;
 * - au filtrage des contenus en fonction du type et de la durée.
 *
 * Les contrôleurs HTTP exposent ces fonctionnalités et peuvent être décorés
 * avec Swagger (`@ApiOperation`, `@ApiResponse`, etc.) afin de générer
 * automatiquement la documentation de l’API.
 */
@Injectable()
export class MeditationSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle séance de méditation pour un utilisateur donné.
   *
   * @param userId Identifiant de l’utilisateur propriétaire de la séance.
   * @param dto Données nécessaires à la création de la séance.
   * @returns La séance de méditation créée.
   */
  async create(
    userId: string,
    dto: CreateMeditationSessionDto,
  ) {
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
   * Calcule un résumé des 7 derniers jours de méditation pour un utilisateur donné.
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un tableau contenant, par jour, la durée totale et quelques métadonnées.
   */
  async getLast7Days(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        startedAt: { gte: sevenDaysAgo },
      },
      orderBy: { startedAt: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.startedAt ? s.startedAt.toISOString().split('T')[0] : null,
      durationSeconds: s.durationSeconds,
      moodAfter: s.moodAfter,
      // Si l’on souhaite exploiter le type côté front :
      meditationTypeId: s.meditationTypeId,
    }));
  }

  /**
   * Calcule un résumé des séances de méditation effectuées la veille.
   *
   * @param userId Identifiant de l’utilisateur.
   * @returns Un objet contenant la durée totale de méditation et
   *          la dernière humeur renseignée après une séance.
   */
  async getYesterdaySummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(today.getDate() - 1);

    const yesterdayEnd = new Date(today);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: yesterdayStart,
          lt: yesterdayEnd,
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
      orderBy: [
        { sortOrder: 'asc' },
        { title: 'asc' },
      ],
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
      },
    });

    // Mapping vers ce que le front attend
    return items.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      mode: c.mode,
      durationSeconds: c.defaultDurationSeconds,
      meditationTypeId: c.defaultMeditationTypeId,
      isPremium: c.isPremium,
      mediaUrl: c.mediaUrl,
    }));
  }
}
