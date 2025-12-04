import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkoutSessionDto } from './dto/workout-session.dto';

@Injectable()
export class WorkoutSessionService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crée ou met à jour une séance pour un utilisateur donné.
     *
     * Règles :
     * - une seule séance par jour **et par utilisateur** ;
     * - si une séance existe déjà ce jour-là → update (quality + exercices).
     */
    async create(userId: string, dto: CreateWorkoutSessionDto) {
        const date = new Date(dto.dateSession);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // 1️⃣ Validate exercise types
        const exerciceTypeIds = dto.exercices.map((e) => e.exerciceTypeId);

        if (exerciceTypeIds.length === 0) {
            throw new BadRequestException('At least one exercice is required');
        }

        const existingTypes = await this.prisma.exerciceType.findMany({
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

        // 2️⃣ Check if a workout already exists that day for this user
        const existingWorkout = await this.prisma.workoutSession.findFirst({
            where: {
                userId,
                dateSession: { gte: startOfDay, lte: endOfDay },
            },
        });

        // 3️⃣ Create or update workout + exerciceSessions
        const fullSession = await this.prisma.$transaction(async (tx) => {
            let workout;

            if (existingWorkout) {
                workout = await tx.workoutSession.update({
                    where: { id: existingWorkout.id },
                    data: {
                        quality: dto.quality ?? existingWorkout.quality,
                        dateSession: date,
                    },
                });
            } else {
                workout = await tx.workoutSession.create({
                    data: {
                        quality: dto.quality ?? null,
                        dateSession: date,
                        userId,
                    },
                });
            }

            // 4️⃣ UPSERT exercise entries (update if exists, otherwise create)
            for (const e of dto.exercices) {
                await tx.exerciceSession.upsert({
                    where: {
                        workoutSessionId_exerciceTypeId: {
                            workoutSessionId: workout.id,
                            exerciceTypeId: e.exerciceTypeId,
                        },
                    },
                    update: {
                        repetitionCount: e.repetitionCount,
                    },
                    create: {
                        workoutSessionId: workout.id,
                        exerciceTypeId: e.exerciceTypeId,
                        repetitionCount: e.repetitionCount,
                    },
                });
            }

            // 5️⃣ Return full workout with exercices
            return tx.workoutSession.findUnique({
                where: { id: workout.id },
                include: {
                    exerciceSessions: {
                        include: {
                            exerciceType: {
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

        // Optionally normalize here too if you want same shape everywhere
        return this.normalizeSession(fullSession);
    }

    /**
     * Toutes les séances d’un utilisateur donné, triées par date décroissante.
     * Format normalisé pour le frontend.
     */
    async findAll(userId: string) {
        const sessions = await this.prisma.workoutSession.findMany({
            where: { userId },
            orderBy: { dateSession: 'desc' },
            include: {
                exerciceSessions: {
                    include: {
                        exerciceType: true,
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
        const workout = await this.prisma.workoutSession.findUnique({
            where: { id },
            include: {
                exerciceSessions: {
                    include: {
                        exerciceType: true,
                    },
                },
            },
        });

        if (!workout) {
            throw new NotFoundException('WorkoutSession not found');
        }

        if (workout.userId !== userId) {
            throw new ForbiddenException('You are not allowed to access this session');
        }

        return this.normalizeSession(workout);
    }

    /**
     * Résumé des 7 derniers jours pour un utilisateur.
     * Utilise le même format que le frontend attend pour `WorkoutSession`.
     */
    async getLast7Days(userId: string) {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const sessions = await this.prisma.workoutSession.findMany({
            where: {
                userId,
                dateSession: { gte: sevenDaysAgo },
            },
            orderBy: { dateSession: 'asc' },
            include: {
                exerciceSessions: {
                    include: {
                        exerciceType: true,
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

        const session = await this.prisma.workoutSession.findFirst({
            where: {
                userId,
                dateSession: { gte: startOfYesterday, lte: endOfYesterday },
            },
            orderBy: { dateSession: 'desc' },
            include: {
                exerciceSessions: {
                    include: { exerciceType: true },
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
    async getExerciceTypes() {
        return this.prisma.exerciceType.findMany({
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
            exercices: session.exerciceSessions.map((e: any) => ({
                exerciceTypeId: e.exerciceTypeId,
                exerciceTypeName: e.exerciceType?.name ?? '',
                repetitionCount: e.repetitionCount,
            })),
        };
    }
}
