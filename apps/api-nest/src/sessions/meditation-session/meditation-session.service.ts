import { Injectable } from '@nestjs/common';
import { MeditationSessionSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';

@Injectable()
export class MeditationSessionService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.meditationSession.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        meditationType: true,
        meditationContent: true,
      },
    });
  }

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

  async getMeditationTypes() {
    return this.prisma.meditationType.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        //{ name: 'asc' },
      ],
      select: {
        id: true,
        slug: true,
        //name: true,
        //description: true,
      },
    });
  }
}
