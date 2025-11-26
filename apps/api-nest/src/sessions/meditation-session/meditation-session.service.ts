import { Injectable } from '@nestjs/common';
import { MeditationSessionSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { MeditationTypeDto } from './dto/meditation-type.dto';
import { mapMeditationTypeToDto } from './mapper/meditation-type.mapper';

@Injectable()
/**
 * Service de gestion des séances de méditation.
 *
 * Cette couche encapsule toute la logique de persistance autour :
 * - de la création de séances
 * - de la récupération d’historiques (7 derniers jours, hier, etc.)
 * - de la récupération des types de méditation
 * - du filtrage des contenus en fonction du type et de la durée
 *
 * Les contrôleurs HTTP exposent ces méthodes et peuvent être décorés
 * avec Swagger (`@ApiOperation`, `@ApiResponse`, etc.) pour générer la
 * documentation de l’API.
 */
export class MeditationSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle séance de méditation.
   *
   * Points importants :
   * - La séance est toujours associée à l'utilisateur "demo@mindfulspace.app"
   *   (utilisateur de démonstration seedé en base).
   * - L'heure de la séance est forcée à midi afin d’éviter les effets de bord
   *   liés aux fuseaux horaires et à l’UTC.
   * - `endedAt` est calculé à partir de `startedAt` et de `durationSeconds`.
   * - La source est par défaut `MANUAL` si non précisée dans le DTO.
   *
   * @param dto Données de création de séance (payload validé par le DTO).
   * @throws Error si l’utilisateur de démo est introuvable.
   * @returns La séance créée (entité Prisma).
   */
  async create(dto: CreateMeditationSessionDto) {
    const demoUser = await this.prisma.user.findUnique({
      where: { email: 'demo@mindfulspace.app' },
    });

    if (!demoUser) {
      // Si le seed n'a pas tourné ou que le user a été supprimé
      throw new Error('Demo user not found. Did you run the seed?');
    }

    // Date logique de la séance -> on fixe l'heure à midi pour éviter les surprises UTC
    const date = new Date(dto.dateSession);
    date.setHours(12, 0, 0, 0);

    const startedAt = date;
    const endedAt = new Date(startedAt.getTime() + dto.durationSeconds * 1000);

    const source = dto.source ?? MeditationSessionSource.MANUAL;

    return this.prisma.meditationSession.create({
      data: {
        userId: demoUser.id,
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
   * Retourne l’ensemble des séances de méditation, triées par date de début
   * décroissante.
   *
   * Les entités retournées incluent les relations vers :
   * - `meditationType`
   * - `meditationContent`
   *
   * Cette méthode est typiquement utilisée dans un endpoint d’administration
   * ou pour un listing complet.
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
   * Retourne un résumé des séances des 7 derniers jours.
   *
   * La fenêtre temporelle est calculée à partir de "maintenant" :
   * - `sevenDaysAgo` = date actuelle - 7 jours, à minuit
   * - on récupère toutes les séances dont `startedAt >= sevenDaysAgo`
   *
   * Le format de retour est volontairement réduit afin de limiter la
   * quantité de données :
   * - `date` (YYYY-MM-DD)
   * - `durationSeconds`
   * - `moodAfter`
   */
  async getLast7Days() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        startedAt: { gte: sevenDaysAgo },
      },
      orderBy: { startedAt: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.startedAt ? s.startedAt.toISOString().split('T')[0] : null,
      durationSeconds: s.durationSeconds,
      moodAfter: s.moodAfter,
    }));
  }

  /**
   * Calcule un résumé des séances d’hier seulement.
   *
   * Logique :
   * - `today` est tronqué à minuit
   * - `yesterdayStart` = today - 1 jour (00:00)
   * - `yesterdayEnd`   = today (00:00)
   *
   * On renvoie :
   * - la durée totale des séances d’hier (en secondes)
   * - la dernière humeur finale (`moodAfter`) constatée
   */
  async getYesterdaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(today.getDate() - 1);

    const yesterdayEnd = new Date(today);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
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
   * Récupère tous les types de méditation actifs.
   *
   * - Filtre uniquement les types `isActive = true`
   * - Trie par `sortOrder` croissant
   * - Mappe les entités Prisma vers des DTO exposables à l’API
   *
   * @returns Liste de `MeditationTypeDto` destinée au front.
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
   * Règles de filtrage :
   * - `meditationTypeId` est obligatoire (sinon erreur).
   * - `isActive` doit être vrai.
   * - `defaultMeditationTypeId` doit correspondre au type fourni.
   * - Si `durationSeconds` est fourni et > 0, on applique une combinaison
   *   de règles sur `minDurationSeconds` et `maxDurationSeconds` :
   *   - cas 1 : min <= duration <= max
   *   - cas 2 : min null, max >= duration
   *   - cas 3 : min <= duration, max null
   *   - cas 4 : min null, max null (aucune contrainte)
   *
   * Le résultat est ensuite réduit à ce que le front attend,
   * à savoir un sous-ensemble de champs + un champ `durationSeconds`
   * basé sur `defaultDurationSeconds`.
   *
   * @param meditationTypeId Identifiant du type de méditation.
   * @param durationSeconds Durée cible en secondes (facultative).
   * @throws Error si `meditationTypeId` est vide.
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

    // mapping vers ce que le front attend
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