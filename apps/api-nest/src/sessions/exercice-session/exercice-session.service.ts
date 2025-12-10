import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExerciceSessionDto } from './dto/exercice-session.dto';

@Injectable()
export class ExerciceSessionService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crée ou met à jour une séance pour un utilisateur donné.
     *
     * Règles :
     * - une seule séance par jour **et par utilisateur** ;
     * - si une séance existe déjà ce jour-là → update (quality + exercices).
     */
    async create(userId: string, dto: CreateExerciceSessionDto) {
        const date = new Date(dto.dateSession);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const exerciceTypeIds = dto.exercices.map((e) => e.exerciceContentId);

        if (exerciceTypeIds.length === 0) {
            throw new BadRequestException('At least one exercice is required');
        }

        const existingTypes = await this.prisma.exerciceContent.findMany({
            where: { id: { in: exerciceTypeIds } },
            select: { id: true },
        });

        const existingTypeIds = new Set(existingTypes.map((t) => t.id));
        const invalidIds = exerciceTypeIds.filter((id) => !existingTypeIds.has(id));

        if (invalidIds.length > 0) {
            throw new BadRequestException(
                `Invalid exerciceTypeId(s): ${invalidIds.join(', ')}`,
            );
        }

        const existingSession = await this.prisma.exerciceSession.findFirst({
            where: {
                userId,
                dateSession: { gte: startOfDay, lte: endOfDay },
            },
        });

        const fullSession = await this.prisma.$transaction(async (tx) => {
            let session;

            if (existingSession) {
                session = await tx.exerciceSession.update({
                    where: { id: existingSession.id },
                    data: {
                        quality: dto.quality ?? existingSession.quality,
                        dateSession: date,
                    },
                });
            } else {
                session = await tx.exerciceSession.create({
                    data: {
                        quality: dto.quality ?? null,
                        dateSession: date,
                        userId,
                    },
                });
            }

            for (const e of dto.exercices) {
                await tx.exerciceSerie.upsert({
                    where: {
                        exerciceSessionId_exerciceContentId: {
                            exerciceSessionId: session.id,
                            exerciceContentId: e.exerciceContentId,
                        },
                    },
                    update: {
                        repetitionCount: e.repetitionCount,
                    },
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
                                    steps: {
                                        orderBy: { order: 'asc' },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        });

        return this.normalizeSession(fullSession);
    }

    /**
     * Toutes les séances d’un utilisateur donné, triées par date décroissante.
     * Format normalisé pour le frontend.
     */
    async findAll(userId: string) {
        const sessions = await this.prisma.exerciceSession.findMany({
            where: { userId },
            orderBy: { dateSession: 'desc' },
            include: {
                exerciceSerie: {
                    include: {
                        exerciceContent: true,
                    },
                },
            },
        });

        return sessions.map((s) => this.normalizeSession(s));
    }

    /**
     * Détail d’une séance appartenant à l’utilisateur.
     * Vérifie l’ownership avant de renvoyer les données.
     */
    async findOne(id: string, userId: string) {
        const session = await this.prisma.exerciceSession.findUnique({
            where: { id },
            include: {
              exerciceSerie: {
                    include: {
                      exerciceContent: true,
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('exerciceSession not found');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access this session');
        }

        return this.normalizeSession(session);
    }

    /**
     * Résumé des 7 derniers jours pour un utilisateur.
     * Utilise le même format que le frontend attend pour `exerciceSession`.
     */
    async getLast7Days(userId: string) {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const sessions = await this.prisma.exerciceSession.findMany({
            where: {
                userId,
                dateSession: { gte: sevenDaysAgo },
            },
            orderBy: { dateSession: 'asc' },
            include: {
              exerciceSerie: {
                    include: {
                      exerciceContent: true,
                    },
                },
            },
        });

        return sessions.map((s) => this.normalizeSession(s));
    }

    /**
     * Résumé de la séance d’hier pour un utilisateur.
     * Si aucune séance n’existe, renvoie un objet “vide”.
     */
    async getYesterdaySummary(userId: string) {
        const today = new Date();
        const startOfYesterday = new Date(today);
        startOfYesterday.setDate(today.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);

        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        const session = await this.prisma.exerciceSession.findFirst({
            where: {
                userId,
                dateSession: { gte: startOfYesterday, lte: endOfYesterday },
            },
            orderBy: { dateSession: 'desc' },
            include: {
              exerciceSerie: {
                    include: { exerciceContent: true },
                },
            },
        });

        if (!session) {
            // structure compatible with frontend expectations
            return {
                id: null,
                date: startOfYesterday.toISOString().split('T')[0],
                quality: null,
                exercices: [],
            };
        }

        return this.normalizeSession(session);
    }

    /**
     * Types d’exercices publics, triés par nom + steps ordonnés.
     */
    async getExerciceContents() {
        return this.prisma.exerciceContent.findMany({
            orderBy: { name: 'asc' },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    /**
     * Normalise une séance brute Prisma vers le format attendu par le frontend.
     *
     *  {
     *    id: string;
     *    date: string; // YYYY-MM-DD
     *    quality: number | null;
     *    exercices: {
     *      exerciceTypeId: string;
     *      exerciceTypeName: string;
     *      repetitionCount: number;
     *    }[];
     *  }
     */
    private normalizeSession(session: any) {
        return {
            id: session.id,
            date: session.dateSession.toISOString().split('T')[0],
            quality: session.quality,
            exercices: session.exerciceSerie.map((e: any) => ({
                exerciceContentId: e.exerciceContentId,
                exerciceContentName: e.exerciceContent?.name ?? '',
                repetitionCount: e.repetitionCount,
            })),
        };
    }
}
