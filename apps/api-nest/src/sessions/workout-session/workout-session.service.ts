import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkoutSessionDto } from './dto/workout-session.dto';

@Injectable()
export class WorkoutSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutSessionDto) {
    const date = new Date(dto.dateSession);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Validate exercice types
    const exerciceTypeIds = dto.exercices.map((e) => e.exerciceTypeId);

    const existingTypes = await this.prisma.exerciceType.findMany({
      where: { id: { in: exerciceTypeIds } },
      select: { id: true },
    });

    const existingTypeIds = new Set(existingTypes.map((t) => t.id));

    const invalidIds = exerciceTypeIds.filter(
      (id) => !existingTypeIds.has(id),
    );

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid exerciceTypeId(s): ${invalidIds.join(', ')}`,
      );
    }

    // 2️⃣ Check if a workout already exists that day
    const existingWorkout = await this.prisma.workoutSession.findFirst({
      where: {
        dateSession: { gte: startOfDay, lte: endOfDay },
      },
    });

    // 3️⃣ Use a transaction to update/create + reset exercices safely
    return this.prisma.$transaction(async (tx) => {
      let workout;

      if (existingWorkout) {
        // Update existing
        workout = await tx.workoutSession.update({
          where: { id: existingWorkout.id },
          data: {
            quality: dto.quality ?? null,
            dateSession: date,
          },
        });

        // Remove old exercices
        await tx.exerciceSession.deleteMany({
          where: { workoutSessionId: workout.id },
        });
      } else {
        // Create new workout
        workout = await tx.workoutSession.create({
          data: {
            quality: dto.quality ?? null,
            dateSession: date,
          },
        });
      }

      // Create new exercice sessions
      if (dto.exercices.length > 0) {
        await tx.exerciceSession.createMany({
          data: dto.exercices.map((e) => ({
            workoutSessionId: workout.id,
            exerciceTypeId: e.exerciceTypeId,
            repetitionCount: e.repetitionCount,
          })),
        });
      }

      // Return workout with exercices + exercice types
      const fullWorkout = await tx.workoutSession.findUnique({
        where: { id: workout.id },
        include: {
          exerciceSessions: {
            include: { exerciceType: true },
          },
        },
      });

      return fullWorkout;
    });
  }

  async findAll() {
    return this.prisma.workoutSession.findMany({
      orderBy: { dateSession: 'desc' },
      include: {
        exerciceSessions: {
          include: {
            exerciceType: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
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

    return workout;
  }

  async getLast7Days() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
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

    return sessions.map((s) => ({
      id: s.id,
      date: s.dateSession.toISOString().split('T')[0],
      quality: s.quality,
      exercices: s.exerciceSessions.map((e) => ({
        exerciceTypeId: e.exerciceTypeId,
        exerciceTypeName: e.exerciceType.name,
        repetitionCount: e.repetitionCount,
      })),
    }));
  }

  async getYesterdaySummary() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(yesterday.getDate() + 1);

    const session = await this.prisma.workoutSession.findFirst({
      where: {
        dateSession: { gte: yesterday, lt: today },
      },
      orderBy: { dateSession: 'desc' },
      include: {
        exerciceSessions: {
          include: { exerciceType: true },
        },
      },
    });

    if (!session) {
      return {
        date: yesterday.toISOString().split('T')[0],
        quality: null,
        exercices: [],
      };
    }

    return {
      date: session.dateSession.toISOString().split('T')[0],
      quality: session.quality,
      exercices: session.exerciceSessions.map((e) => ({
        exerciceTypeId: e.exerciceTypeId,
        exerciceTypeName: e.exerciceType.name,
        repetitionCount: e.repetitionCount,
      })),
    };
  }
}
