// sleep-session.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSleepSessionDto } from './dto/sleep-session.dto';
import { Prisma } from "@prisma/client";

@Injectable()
export class SleepSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSleepSessionDto) {
    const date = new Date(dto.dateSession);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.prisma.sleepSession.findFirst({
      where: { userId, dateSession: { gte: startOfDay, lte: endOfDay } },
    });

    if (existing) {
      return this.prisma.sleepSession.update({
        where: { id: existing.id },
        data: {
          hours: dto.hours,
          quality: dto.quality ?? null,
          dateSession: date,
          userId,
        },
      });
    }

    return this.prisma.sleepSession.create({
      data: {
        hours: dto.hours,
        quality: dto.quality ?? null,
        dateSession: date,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.sleepSession.findMany({
      orderBy: { dateSession: 'desc' },
    });
  }

  async getLast7Days(userId: string) {
    return this.getLastNDays(userId, 7);
  }

  async getLastNDays(userId: string, n: number) {
    const from = new Date();
    from.setDate(from.getDate() - n);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.sleepSession.findMany({
      where: { userId, dateSession: { gte: from } },
      orderBy: { dateSession: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split('T')[0],
      hours: s.hours,
      quality: s.quality,
    }));
  }

  async getAllForUser(userId: string) {
    const sessions = await this.prisma.sleepSession.findMany({
      where: { userId },
      orderBy: { dateSession: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split('T')[0],
      hours: s.hours,
      quality: s.quality,
    }));
  }

  async getSessionsBetweenDates(
    userId: string,
    range: { from?: string; to?: string },
  ) {
    // si ni from ni to valides, fallback -> all (inchangé)
    if (!range.from && !range.to) {
      return this.getAllForUser(userId);
    }

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

    const where: Prisma.SleepSessionWhereInput = {
      userId,
      // On ne met dateSession que si au moins une borne est définie
      ...(Object.keys(dateFilter).length > 0 ? { dateSession: dateFilter } : {}),
    };

    const sessions = await this.prisma.sleepSession.findMany({
      where,
      orderBy: { dateSession: "asc" },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split("T")[0],
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
      where: { dateSession: { gte: yesterday, lt: today } },
      orderBy: { dateSession: 'desc' },
    });

    return {
      hours: session?.hours ?? null,
      quality: session?.quality ?? null,
    };
  }

  async getDailySummary(userId: string, date?: string) {
    const target = date ? new Date(date) : new Date();
    if (!date) target.setDate(target.getDate() - 1);

    const start = new Date(target);
    start.setHours(0, 0, 0, 0);

    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const session = await this.prisma.sleepSession.findFirst({
      where: { userId, dateSession: { gte: start, lte: end } },
      orderBy: { dateSession: 'desc' },
    });

    return {
      date: start.toISOString().split('T')[0],
      hours: session?.hours ?? null,
      quality: session?.quality ?? null,
    };
  }
}
