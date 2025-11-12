import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a session for a given SessionType.
   * - Validates that SessionType exists
   * - (Optional) Validates the expected unit matches the type’s unit
   */
  async create(dto: CreateSessionDto) {
    // 1️⃣ Resolve the type + its unit
    const type = await this.prisma.sessionType.findUnique({
      where: { id: dto.sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!type) {
      throw new NotFoundException('SessionType not found');
    }

    // 2️⃣ Optional: guard against unit mismatch
    if (dto.expectedUnit && dto.expectedUnit !== type.sessionUnit.value) {
      throw new BadRequestException(
        `Unit mismatch: expected ${dto.expectedUnit} but SessionType uses ${type.sessionUnit.value}`,
      );
    }

    // 3️⃣ Parse date and compute the day boundaries (00:00 → 23:59)
    const date = new Date(dto.dateSession);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 4️⃣ Check if a session already exists for this type & date
    const existing = await this.prisma.session.findFirst({
      where: {
        sessionTypeId: dto.sessionTypeId,
        dateSession: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      // ✅ 5️⃣ If found, update it instead of creating a duplicate
      return this.prisma.session.update({
        where: { id: existing.id },
        data: {
          value: dto.value,
          quality: dto.quality ?? null,
          dateSession: new Date(dto.dateSession),
        },
      });
    }

    // 6️⃣ Otherwise, create a new session
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
    // Retrieve all sessions, with their type and unit
    return this.prisma.session.findMany({
      orderBy: { dateSession: 'desc' },
      include: {
        sessionType: {
          include: {
            sessionUnit: true,
          },
        },
      },
    });
  }

  async getAllSessionTypes() {
    return this.prisma.sessionType.findMany({
      include: {
        sessionUnit: true, // include the unit (Minutes, Hours)
      },
    });
  }

  async getSessionsLast7Days(typeName: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find the matching session type by name (case-insensitive)
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
    // Compute yesterday's date range (00:00 → 23:59)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date(yesterday);
    today.setDate(yesterday.getDate() + 1);

    // Fetch all session types
    const sessionTypes = await this.prisma.sessionType.findMany();

    // For each type, find the last session from yesterday
    const results = await Promise.all(
      sessionTypes.map(async (type) => {
        const session = await this.prisma.session.findFirst({
          where: {
            sessionTypeId: type.id,
            dateSession: {
              gte: yesterday,
              lt: today,
            },
          },
          orderBy: { dateSession: 'desc' },
        });

        return {
          name: type.name,
          value: session?.value ?? null,
          unit: (await this.prisma.sessionUnit.findUnique({
            where: { id: type.sessionUnitId },
          }))?.value,
        };
      })
    );

    return results;
  }



}
