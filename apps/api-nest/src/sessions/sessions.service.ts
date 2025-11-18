import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    // 1️⃣ Resolve the type + ordered units
    const type = await this.prisma.sessionType.findUnique({
      where: { id: dto.sessionTypeId },
      include: {
        units: {
          include: { sessionUnit: true },
          orderBy: { priority: 'asc' },   // ⭐ added
        },
      },
    });

    if (!type) {
      throw new NotFoundException('SessionType not found');
    }

    // 2️⃣ Validate unit consistency (optional)
    if (dto.expectedUnit) {
      const allowedUnits = type.units.map(u => u.sessionUnit.value);

      if (!allowedUnits.includes(dto.expectedUnit)) {
        throw new BadRequestException(
          `Unit mismatch: expected one of [${allowedUnits.join(", ")}] but received ${dto.expectedUnit}`,
        );
      }
    }

    // 3️⃣ Parse date boundaries
    const date = new Date(dto.dateSession);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 4️⃣ Check for an existing session for that day
    const existing = await this.prisma.session.findFirst({
      where: {
        sessionTypeId: dto.sessionTypeId,
        dateSession: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      return this.prisma.session.update({
        where: { id: existing.id },
        data: {
          value: dto.value,
          quality: dto.quality ?? null,
          dateSession: new Date(dto.dateSession),
        },
      });
    }

    // 6️⃣ Create a new session
    return this.prisma.session.create({
      data: {
        value: dto.value,
        quality: dto.quality ?? null,
        dateSession: new Date(dto.dateSession),
        sessionTypeId: dto.sessionTypeId,
      },
    });
  }

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { dateSession: 'desc' },
      include: {
        sessionType: {
          include: {
            units: {
              include: { sessionUnit: true },
              orderBy: { priority: 'asc' },  // ⭐ added
            },
          },
        },
      },
    });
  }

  async getAllSessionTypes() {
    return this.prisma.sessionType.findMany({
      include: {
        units: {
          include: {
            sessionUnit: true,
          },
          orderBy: { priority: 'asc' },       // ⭐ added
        },
      },
    });
  }

  async getSessionsLast7Days(typeName: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionType = await this.prisma.sessionType.findFirst({
      where: { name: { equals: typeName, mode: 'insensitive' } },
    });

    if (!sessionType) {
      throw new Error(`Session type "${typeName}" not found`);
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        sessionTypeId: sessionType.id,
        dateSession: { gte: sevenDaysAgo },
      },
      orderBy: { dateSession: 'asc' },
    });

    return sessions.map((s) => ({
      date: s.dateSession.toISOString().split('T')[0],
      value: s.value,
    }));
  }

  async getYesterdaySummary() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(yesterday.getDate() + 1);

    const sessionTypes = await this.prisma.sessionType.findMany({
      include: {
        units: {
          include: { sessionUnit: true },
          orderBy: { priority: 'asc' },   // ⭐ added
        },
      },
    });

    return Promise.all(
      sessionTypes.map(async (type) => {
        const session = await this.prisma.session.findFirst({
          where: {
            sessionTypeId: type.id,
            dateSession: { gte: yesterday, lt: today },
          },
          orderBy: { dateSession: 'desc' },
        });

        return {
          name: type.name,
          value: session?.value ?? null,
          units: type.units.map((u) => u.sessionUnit.value), // already ordered
        };
      })
    );
  }
}
