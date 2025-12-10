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
            sleepItems: true,
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
            sleepItems: true,
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
            sleepItems: {
              create: day.sleepItems.map((sleep) => ({
                hours: sleep.defaultHours,
              })),
            }
          })),
        },
      },
      include: {
        days: {
          include: {
            exerciceItems: true,
            sleepItems: true,
          },
        },
      },
    });
  }

  async subscribe(userId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        days: { include: { exerciceItems: true, sleepItems: true } },
      },
    });


    if (!program) throw new NotFoundException();
    console.log(program.days[0])

    return this.prisma.$transaction(async (tx) => {
      return tx.userProgram.create({
        data: {
          userId,
          programId,
          days: {
            create: program.days.map((day) => ({
              title: day.title,
              order: day.order,
              weekday: day.weekday,
              exercices: {
                create: day.exerciceItems.map((ex) => ({
                  exerciceContentId: ex.exerciceContentId,
                  defaultRepetitionCount: ex.defaultRepetitionCount,
                  defaultSets: ex.defaultSets,
                })),
              },
              sleepItems: {
                create: day.sleepItems.map((s) => ({
                  hours: s.defaultHours,
                })),
              }
            })),
          },
        },
      });
    });
  }

}
