import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickTranslation } from '@mindfulspace/api/common/utils/i18n';

@Injectable()
export class UserProgramService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, { lang }: { lang: string }) {
    const userPrograms = await this.prisma.userProgram.findMany({
      where: { userId },
      include: {
        translations: true,
        days: {
          orderBy: { order: 'asc' },
          include: {
            translations: true,
            exercices: {
              include: {
                exerciceContent: {
                  include: {
                    translations: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return userPrograms.map(up => {
      const programTranslation = pickTranslation(up.translations, lang);

      return {
        id: up.id,
        title: programTranslation?.title,
        description: programTranslation?.description,
        days: up.days.map(day => {
          const dayTranslation = pickTranslation(day.translations, lang);

          return {
            id: day.id,
            order: day.order,
            weekday: day.weekday,
            title: dayTranslation?.title,
            exercices: day.exercices.map(ex => {
              const exTranslation = pickTranslation(
                ex.exerciceContent.translations,
                lang,
              );

              return {
                id: ex.id,
                defaultRepetitionCount: ex.defaultRepetitionCount,
                defaultSets: ex.defaultSets,
                exercice: {
                  id: ex.exerciceContent.id,
                  name: exTranslation?.name,
                  description: exTranslation?.description,
                },
              };
            }),
          };
        }),
      };
    });
  }

  async findOne(
    userId: string,
    userProgramId: string,
    { lang }: { lang: string },
  ) {
    const up = await this.prisma.userProgram.findFirst({
      where: { id: userProgramId, userId },
      include: {
        translations: true,
        days: {
          orderBy: { order: 'asc' },
          include: {
            translations: true,
            exercices: {
              include: {
                exerciceContent: {
                  include: {
                    translations: true,
                    steps: {
                      orderBy: { order: 'asc' },
                      include: { translations: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!up) throw new NotFoundException('User program not found');

    const programTranslation = pickTranslation(up.translations, lang);

    return {
      id: up.id,
      title: programTranslation?.title,
      description: programTranslation?.description,
      days: up.days.map(day => {
        const dayTranslation = pickTranslation(day.translations, lang);

        return {
          id: day.id,
          order: day.order,
          weekday: day.weekday,
          title: dayTranslation?.title,
          exercices: day.exercices.map(ex => {
            const exTranslation = pickTranslation(
              ex.exerciceContent.translations,
              lang,
            );

            return {
              id: ex.id,
              defaultRepetitionCount: ex.defaultRepetitionCount,
              defaultSets: ex.defaultSets,
              exercice: {
                id: ex.exerciceContent.id,
                name: exTranslation?.name,
                description: exTranslation?.description,
                steps: ex.exerciceContent.steps.map(step => {
                  const stepTranslation = pickTranslation(
                    step.translations,
                    lang,
                  );

                  return {
                    order: step.order,
                    title: stepTranslation?.title,
                    description: stepTranslation?.description,
                    imageUrl: step.imageUrl,
                  };
                }),
              },
            };
          }),
        };
      }),
    };
  }


  async delete(userId: string, userProgramId: string) {
    return this.prisma.userProgram.deleteMany({
      where: { id: userProgramId, userId },
    });
  }


  async isSubscribed(userId: string, programId: string) {
    return this.prisma.userProgram.findFirst({
      where: { userId, programId },
    });
  }

}
