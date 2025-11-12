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

    // 1) Resolve the type + its unit
    const type = await this.prisma.sessionType.findUnique({
      where: { id: dto.sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!type) {
      throw new NotFoundException('SessionType not found');
    }

    // 2) Optional: guard against UI/type mismatch
    if (dto.expectedUnit && dto.expectedUnit !== type.sessionUnit.value) {
      throw new BadRequestException(
        `Unit mismatch: expected ${dto.expectedUnit} but SessionType uses ${type.sessionUnit.value}`,
      );
    }

    // 3) Create the session
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

}
