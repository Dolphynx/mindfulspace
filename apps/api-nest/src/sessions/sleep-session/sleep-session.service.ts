// sleep-session.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSleepSessionDto } from './dto/sleep-session.dto';

@Injectable()
export class SleepSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSleepSessionDto) {
    const date = new Date(dto.dateSession);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for existing sleep session of that day
    const existing = await this.prisma.sleepSession.findFirst({
      where: { dateSession: { gte: startOfDay, lte: endOfDay } },
    });

    if (existing) {
      return this.prisma.sleepSession.update({
        where: { id: existing.id },
        data: {
          hours: dto.hours,
          quality: dto.quality ?? null,
          dateSession: date,
        },
      });
    }

    // Create new entry
    return this.prisma.sleepSession.create({
      data: {
        hours: dto.hours,
        quality: dto.quality ?? null,
        dateSession: date,
      },
    });
  }

  async findAll() {
    return this.prisma.sleepSession.findMany({
      orderBy: { dateSession: 'desc' },
    });
  }

  async getLast7Days() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.sleepSession.findMany({
      where: {
        dateSession: { gte: sevenDaysAgo },
      },
      orderBy: { dateSession: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split('T')[0],
      hours: s.hours,
      quality: s.quality,
    }));
  }

  async getYesterdaySummary() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(yesterday.getDate() + 1);

    const session = await this.prisma.sleepSession.findFirst({
      where: {
        dateSession: { gte: yesterday, lt: today },
      },
      orderBy: { dateSession: 'desc' },
    });

    return {
      hours: session?.hours ?? null,
      quality: session?.quality ?? null,
    };
  }
}
