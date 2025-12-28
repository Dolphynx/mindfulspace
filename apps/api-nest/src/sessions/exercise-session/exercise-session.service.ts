import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExerciceSessionDto } from './dto/exercise-session.dto';
import { Prisma } from '@prisma/client';
import { pickTranslation } from '@mindfulspace/api/common/utils/i18n';

type ExerciceSessionWithRelations =
  Prisma.ExerciceSessionGetPayload<{
    include: {
      exerciceSerie: {
        include: {
          exerciceContent: {
            include: {
              translations: true;
            };
          };
        };
      };
    };
  }>;


@Injectable()
export class ExerciseSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée ou met à jour une séance d'exercices pour un utilisateur.
   *
   * Règles métier :
   * - Un utilisateur ne peut avoir qu'une seule séance par jour
   * - Si une séance existe déjà pour la date donnée, elle est mise à jour
   * - Les exercices sont liés par référence (`ExerciceContent`)
   *
   * @param userId Identifiant de l'utilisateur
   * @param dto Données de création ou mise à jour de la séance
   *
   * @throws BadRequestException Si aucun exercice n'est fourni
   * @throws BadRequestException Si un ou plusieurs exercices sont invalides
   *
   * @returns Séance créée ou mise à jour (format normalisé)
   */

  async create(userId: string, dto: CreateExerciceSessionDto) {
    const date = new Date(dto.dateSession);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const exerciceContentIds = dto.exercices.map(e => e.exerciceContentId);
    if (!exerciceContentIds.length) {
      throw new BadRequestException('At least one exercice is required');
    }

    const existingTypes = await this.prisma.exerciceContent.findMany({
      where: { id: { in: exerciceContentIds } },
      select: { id: true },
    });

    const existingIds = new Set(existingTypes.map(t => t.id));
    const invalidIds = exerciceContentIds.filter(id => !existingIds.has(id));
    if (invalidIds.length) {
      throw new BadRequestException(
        `Invalid exerciceContentId(s): ${invalidIds.join(', ')}`,
      );
    }

    const existingSession = await this.prisma.exerciceSession.findFirst({
      where: {
        userId,
        dateSession: { gte: startOfDay, lte: endOfDay },
      },
    });

    const fullSession = await this.prisma.$transaction(async tx => {
      const session = existingSession
        ? await tx.exerciceSession.update({
          where: { id: existingSession.id },
          data: {
            quality: dto.quality ?? existingSession.quality,
            dateSession: date,
          },
        })
        : await tx.exerciceSession.create({
          data: {
            quality: dto.quality ?? null,
            dateSession: date,
            userId,
          },
        });

      for (const e of dto.exercices) {
        await tx.exerciceSerie.upsert({
          where: {
            exerciceSessionId_exerciceContentId: {
              exerciceSessionId: session.id,
              exerciceContentId: e.exerciceContentId,
            },
          },
          update: { repetitionCount: e.repetitionCount },
          create: {
            exerciceSessionId: session.id,
            exerciceContentId: e.exerciceContentId,
            repetitionCount: e.repetitionCount,
          },
        });
      }

      return tx.exerciceSession.findUnique({
        where: { id: session.id },
        include: {
          exerciceSerie: {
            include: {
              exerciceContent: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      });
    });

    return fullSession;
  }

  /**
   * Récupère toutes les séances d'un utilisateur.
   *
   * Les séances sont triées par date décroissante.
   * Les noms des exercices sont résolus dynamiquement selon la langue demandée.
   *
   * @param userId Identifiant de l'utilisateur
   * @param params Paramètres de langue
   *
   * @returns Liste normalisée des séances
   */

  async findAll(userId: string, { lang }: { lang: string }) {
    const sessions = await this.prisma.exerciceSession.findMany({
      where: { userId },
      orderBy: { dateSession: 'desc' },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    return sessions.map(s => this.normalizeSession(s, lang));
  }

  /**
   * Récupère le détail d'une séance spécifique appartenant à l'utilisateur.
   *
   * Vérifie l'ownership avant de retourner les données.
   *
   * @param id Identifiant de la séance
   * @param userId Identifiant de l'utilisateur
   * @param params Paramètres de langue
   *
   * @throws NotFoundException Si la séance n'existe pas
   * @throws ForbiddenException Si la séance n'appartient pas à l'utilisateur
   *
   * @returns Séance normalisée
   */

  async findOne(id: string, userId: string, { lang }: { lang: string }) {
    const session = await this.prisma.exerciceSession.findUnique({
      where: { id },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('ExerciceSession not found');
    if (session.userId !== userId) {
      throw new ForbiddenException('You are not allowed to access this session');
    }

    return this.normalizeSession(session, lang);
  }

  /**
   * Récupère les séances des 7 derniers jours.
   *
   * @param userId Identifiant de l'utilisateur
   * @param params Paramètres de langue
   *
   * @returns Liste chronologique des séances
   */

  async getLast7Days(userId: string, { lang }: { lang: string }) {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.exerciceSession.findMany({
      where: {
        userId,
        dateSession: { gte: from },
      },
      orderBy: { dateSession: 'asc' },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    return sessions.map(s => this.normalizeSession(s, lang));
  }

  /**
   * Récupère les séances des N derniers jours.
   *
   * @param userId Identifiant de l'utilisateur
   * @param n Nombre de jours à remonter
   * @param params Paramètres de langue
   *
   * @returns Liste chronologique des séances
   */

  async getLastNDays(userId: string, n: number, { lang }: { lang: string }) {
    const from = new Date();
    from.setDate(from.getDate() - n);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.exerciceSession.findMany({
      where: {
        userId,
        dateSession: { gte: from },
      },
      orderBy: { dateSession: 'asc' },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    return sessions.map(s => this.normalizeSession(s, lang));
  }

  /**
   * Récupère les séances comprises entre deux dates.
   *
   * Les dates sont interprétées en heure locale.
   *
   * @param userId Identifiant de l'utilisateur
   * @param range Intervalle de dates
   * @param params Paramètres de langue
   *
   * @returns Liste chronologique des séances
   */

  async getSessionsBetweenDates(
    userId: string,
    range: { from?: string; to?: string },
    { lang }: { lang: string },
  ) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (range.from) {
      const d = new Date(range.from);
      d.setHours(0, 0, 0, 0);
      dateFilter.gte = d;
    }

    if (range.to) {
      const d = new Date(range.to);
      d.setHours(23, 59, 59, 999);
      dateFilter.lte = d;
    }

    const sessions = await this.prisma.exerciceSession.findMany({
      where: {
        userId,
        ...(Object.keys(dateFilter).length ? { dateSession: dateFilter } : {}),
      },
      orderBy: { dateSession: 'asc' },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    return sessions.map(s => this.normalizeSession(s, lang));
  }

  /**
   * Récupère le résumé de la séance d'hier.
   *
   * Si aucune séance n'existe, une structure vide est retournée
   * afin de simplifier la logique côté frontend.
   *
   * @param userId Identifiant de l'utilisateur
   * @param params Paramètres de langue
   *
   * @returns Résumé de séance ou structure vide
   */

  async getYesterdaySummary(userId: string, { lang }: { lang: string }) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const session = await this.prisma.exerciceSession.findFirst({
      where: {
        userId,
        dateSession: { gte: start, lte: end },
      },
      include: {
        exerciceSerie: {
          include: {
            exerciceContent: {
              include: { translations: true },
            },
          },
        },
      },
    });

    if (!session) {
      return {
        id: null,
        date: start.toISOString().split('T')[0],
        quality: null,
        exercices: [],
      };
    }

    return this.normalizeSession(session, lang);
  }

  /**
   * Normalise une séance Prisma brute vers le format attendu par le frontend.
   *
   * Cette méthode :
   * - résout les traductions selon la langue
   * - applique le fallback linguistique
   * - garantit un format stable pour l'UI
   *
   * @param session Séance brute Prisma
   * @param lang Langue demandée
   *
   * @returns Séance normalisée
   */

  async getExerciceContents({ lang }: { lang: string }) {
    const contents = await this.prisma.exerciceContent.findMany({
      include: {
        translations: true,
        steps: {
          orderBy: { order: 'asc' },
          include: { translations: true },
        },
      },
    });

    return contents.map(c => {
      const t = pickTranslation(c.translations, lang);

      return {
        id: c.id,
        name: t?.name,
        description: t?.description,
        steps: c.steps.map(step => {
          const st = pickTranslation(step.translations, lang);
          return {
            order: step.order,
            title: st?.title,
            description: st?.description,
            imageUrl: step.imageUrl,
          };
        }),
      };
    });
  }

  /**
   * Normalise une séance Prisma brute vers le format attendu par le frontend.
   *
   * Cette méthode :
   * - résout les traductions selon la langue
   * - applique le fallback linguistique
   * - garantit un format stable pour l'UI
   *
   * @param session Séance brute Prisma
   * @param lang Langue demandée
   *
   * @returns Séance normalisée
   */
  private normalizeSession(
    session: ExerciceSessionWithRelations,
    lang: string,
  ) {
    return {
      id: session.id,
      date: session.dateSession.toISOString().split('T')[0],
      quality: session.quality,
      exercices: session.exerciceSerie.map(e => {
        const t = pickTranslation(e.exerciceContent.translations, lang);

        return {
          exerciceContentId: e.exerciceContentId,
          exerciceContentName: t?.name ?? '',
          repetitionCount: e.repetitionCount,
        };
      }),
    };
  }

}
