import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';

@Injectable()
export class MeditationSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMeditationSessionDto) {
    const date = new Date(dto.dateSession);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Is there already a meditation session for this day?
    const existing = await this.prisma.meditationSession.findFirst({
      where: { dateSession: { gte: startOfDay, lte: endOfDay } },
    });

    if (existing) {
      return this.prisma.meditationSession.update({
        where: { id: existing.id },
        data: {
          duration: dto.duration,
          quality: dto.quality ?? null,
          dateSession: date,
        },
      });
    }

    // Otherwise, create a new entry
    return this.prisma.meditationSession.create({
      data: {
        duration: dto.duration,
        quality: dto.quality ?? null,
        dateSession: date,
      },
    });
  }

  async findAll() {
    return this.prisma.meditationSession.findMany({
      orderBy: { dateSession: 'desc' },
    });
  }

  async getLast7Days() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.meditationSession.findMany({
      where: {
        dateSession: { gte: sevenDaysAgo },
      },
      orderBy: { dateSession: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split('T')[0],
      duration: s.duration,
      quality: s.quality,
    }));
  }

  async getYesterdaySummary() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(yesterday.getDate() + 1);

    const session = await this.prisma.meditationSession.findFirst({
      where: {
        dateSession: { gte: yesterday, lt: today },
      },
      orderBy: { dateSession: 'desc' },
    });

    return {
      duration: session?.duration ?? null,
      quality: session?.quality ?? null,
    };
  }
}
