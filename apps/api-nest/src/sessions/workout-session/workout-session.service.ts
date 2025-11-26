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

    // 1️⃣ Validate exercise types
    const exerciceTypeIds = dto.exercices.map((e) => e.exerciceTypeId);

    const existingTypes = await this.prisma.exerciceType.findMany({
      where: { id: { in: exerciceTypeIds } },
      select: { id: true },
    });

    const existingTypeIds = new Set(existingTypes.map((t) => t.id));
    const invalidIds = exerciceTypeIds.filter((id) => !existingTypeIds.has(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid exerciceTypeId(s): ${invalidIds.join(", ")}`
      );
    }

    // 2️⃣ Check if a workout already exists that day
    const existingWorkout = await this.prisma.workoutSession.findFirst({
      where: {
        dateSession: { gte: startOfDay, lte: endOfDay },
      },
    });

    // 3️⃣ Create or update workout + exerciceSessions
    return this.prisma.$transaction(async (tx) => {
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
            repetitionCount: e.repetitionCount, // override 💪
          },
          create: {
            workoutSessionId: workout.id,
            exerciceTypeId: e.exerciceTypeId,
            repetitionCount: e.repetitionCount,
          },
        });
      }

      // 5️⃣ Return full workout with exerciceSessions and steps
      return tx.workoutSession.findUnique({
        where: { id: workout.id },
        include: {
          exerciceSessions: {
            include: {
              exerciceType: {
                include: {
                  steps: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
        },
      });
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

  async getExerciceTypes() {
    return this.prisma.exerciceType.findMany({
      orderBy: { name: "asc" },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
      },
    });
  }


}
