import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { pickTranslation } from '@mindfulspace/api/common/utils/i18n';

@Injectable()
export class ProgramService {
  constructor(private prisma: PrismaService) {}

  async getAll({ lang }: { lang: string }) {
    const programs = await this.prisma.program.findMany({
      include: {
        translations: true,
        days: {
          orderBy: { order: 'asc' },
          include: {
            translations: true,
            exerciceItems: {
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

    return programs.map(program => {
      const programTranslation = pickTranslation(program.translations, lang);

      return {
        id: program.id,
        title: programTranslation?.title,
        description: programTranslation?.description,
        days: program.days.map(day => {
          const dayTranslation = pickTranslation(day.translations, lang);

          return {
            id: day.id,
            order: day.order,
            weekday: day.weekday,
            title: dayTranslation?.title,
            exercices: day.exerciceItems.map(ex => {
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


  async getOne(id: string, { lang }: { lang: string }) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        translations: true,
        days: {
          orderBy: { order: 'asc' },
          include: {
            translations: true,
            exerciceItems: {
              include: {
                exerciceContent: {
                  include: {
                    translations: true,
                    steps: {
                      orderBy: { order: 'asc' },
                      include: {
                        translations: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const programTranslation = pickTranslation(program.translations, lang);

    return {
      id: program.id,
      title: programTranslation?.title,
      description: programTranslation?.description,
      days: program.days.map(day => {
        const dayTranslation = pickTranslation(day.translations, lang);

        return {
          id: day.id,
          order: day.order,
          weekday: day.weekday,
          title: dayTranslation?.title,
          exercices: day.exerciceItems.map(ex => {
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


  async create(dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: {
        translations: {
          create: dto.translations.map(t => ({
            languageCode: t.languageCode,
            title: t.title,
            description: t.description,
          })),
        },
        days: {
          create: dto.days.map(day => ({
            order: day.order,
            weekday: day.weekday,
            translations: {
              create: day.translations,
            },
            exerciceItems: {
              create: day.exercices.map(ex => ({
                exerciceContentId: ex.exerciceContentId,
                defaultRepetitionCount: ex.defaultRepetitionCount,
                defaultSets: ex.defaultSets,
              })),
            },
          })),
        },
      },
    });
  }


  async subscribe(userId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        translations: true,
        days: {
          include: {
            translations: true,
            exerciceItems: true,
          },
        },
      },
    });

    if (!program) throw new NotFoundException('Program not found');

    return this.prisma.$transaction(tx =>
      tx.userProgram.create({
        data: {
          userId,
          programId,
          translations: {
            create: program.translations.map(t => ({
              languageCode: t.languageCode,
              title: t.title,
              description: t.description,
            })),
          },
          days: {
            create: program.days.map(day => ({
              order: day.order,
              weekday: day.weekday,
              translations: {
                create: day.translations.map(t => ({
                  languageCode: t.languageCode,
                  title: t.title,
                })),
              },
              exercices: {
                create: day.exerciceItems.map(ex => ({
                  exerciceContentId: ex.exerciceContentId,
                  defaultRepetitionCount: ex.defaultRepetitionCount,
                  defaultSets: ex.defaultSets,
                })),
              },
            })),
          },
        },
      }),
    );
  }

}
