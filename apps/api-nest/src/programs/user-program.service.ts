import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserProgramService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        days: { include: { exerciceItems: true } },
      },
    });

    if (!program) throw new NotFoundException();

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
            })),
          },
        },
      });
    });
  }


  async findAll(userId: string) {
    return this.prisma.userProgram.findMany({
      where: { userId },
      include: {
        program: {
          select: { title: true },
        },
        days: {
          include: {
            exercices: {
              include: {
                exerciceContent: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.userProgram.delete({
      where: { id },
    });
  }

  async isSubscribed(userId: string, programId: string) {
    return this.prisma.userProgram.findFirst({
      where: { userId, programId },
    });
  }

}
