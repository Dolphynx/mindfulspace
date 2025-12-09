import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';

@Injectable()
export class WorkoutProgramService {
    constructor(private prisma: PrismaService) {}

    async getAll() {
      return this.prisma.workoutProgram.findMany({
        include: {
          days: {
            include: {
              exercices: {
                include: {
                  exerciceType: true,   // 👈 include name + description
                },
              },
            },
          },
        },
      });

    }

    async getOne(id: string) {
        const program = await this.prisma.workoutProgram.findUnique({
            where: { id },
            include: {
                days: {
                    include: {
                      exercices:  {
                        include: {
                          exerciceType: true,
                        }
                      }
                    },
                },
            },
        });

        if (!program) {
            throw new NotFoundException('Workout program not found');
        }

        return program;
    }

    async create(dto: CreateWorkoutProgramDto) {
        return this.prisma.workoutProgram.create({
            data: {
                title: dto.title,
                description: dto.description,
                days: {
                    create: dto.days.map((day) => ({
                        title: day.title,
                        order: day.order,
                        weekday: day.weekday,
                        exercices: {
                            create: day.exercices.map((e) => ({
                                exerciceTypeId: e.exerciceTypeId,
                                defaultRepetitionCount: e.defaultRepetitionCount,
                                defaultSets: e.defaultSets,
                            })),
                        },
                    })),
                },
            },
            include: {
                days: {
                    include: { exercices: true },
                },
            },
        });
    }
}
