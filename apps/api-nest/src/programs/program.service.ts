import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';

@Injectable()
export class ProgramService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.program.findMany({
      include: {
        days: {
          include: {
            exerciceItems: {
              include: {
                exerciceContent: true,  // include name + description
              },
            },
          },
        },
      },
    });
  }

  async getOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        days: {
          include: {
            exerciceItems: {
              include: {
                exerciceContent: true,
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async create(dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: {
        title: dto.title,
        description: dto.description,
        days: {
          create: dto.days.map((day) => ({
            title: day.title,
            order: day.order,
            weekday: day.weekday,
            exerciceItems: {
              create: day.exercices.map((e) => ({
                exerciceContentId: e.exerciceContentId, // renamed!
                defaultRepetitionCount: e.defaultRepetitionCount,
                defaultSets: e.defaultSets,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            exerciceItems: true,
          },
        },
      },
    });
  }
}
