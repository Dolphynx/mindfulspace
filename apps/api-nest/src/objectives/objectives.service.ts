import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectiveDurationUnit, ObjectiveFrequency } from '@prisma/client';
import type { ObjectiveLevel } from './objectives.types';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDemoUser() {
    const email = process.env.DEMO_USER_EMAIL ?? 'demo@mindfulspace.app';

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        `Demo user not found (email: ${email}). Did you run db:seed + db:seed:objectives-poc ?`,
      );
    }

    return user;
  }

  /**
   * Retourne tous les objectifs du user de démo,
   * avec les infos nécessaires pour l’affichage front.
   */
  async getObjectivesForDemoUser() {
    const demoUser = await this.getDemoUser();

    const objectives = await this.prisma.objective.findMany({
      where: {
        userId: demoUser.id,
      },
      include: {
        sessionType: {
          include: { sessionUnit: true },
        },
        //sessionUnit: true,
      },
    });

    return objectives.map((o) => ({
      id: o.id,
      sessionTypeId: o.sessionTypeId,
      sessionTypeName: o.sessionType?.name ?? 'Type de session',
      //unitLabel:
      //  o.sessionType?.sessionUnit?.value ?? o.sessionUnit?.value ?? '',
      unitLabel: o.sessionType?.sessionUnit?.value ?? '',
      value: o.value,
      frequency: o.frequency,
      durationUnit: o.durationUnit,
      durationValue: o.durationValue,
      // on ne retourne pas level ici, il n’est pas stocké en DB
    }));
  }

  /**
   * Calcule la moyenne sur les X derniers jours pour un type de session
   * et propose easy / normal / challenge.
   */
  async proposeForSessionType(sessionTypeId: string) {
    if (!sessionTypeId) {
      throw new BadRequestException('sessionTypeId is required');
    }

    const demoUser = await this.getDemoUser();

    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!sessionType) {
      throw new NotFoundException('SessionType not found');
    }

    const daysBack = 14;
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: demoUser.id,
        sessionTypeId,
        dateSession: { gte: since },
      },
    });

    if (sessions.length === 0) {
      throw new NotFoundException(
        `No sessions found for demo user and sessionType ${sessionType.name} in last ${daysBack} days`,
      );
    }

    const total = sessions.reduce((sum, s) => sum + s.value, 0);
    const average = total / sessions.length;

    // arrondit au dixième
    const round1 = (value: number) => Math.round(value * 10) / 10;
    // arrondit à l'unité
    const round0 = (value: number) => Math.round(value);

    const easy = round0(average * 0.8);
    const normal = round0(average);
    const challenge = round0(average * 1.2);

    const frequency: ObjectiveFrequency = 'DAILY';
    const durationUnit: ObjectiveDurationUnit = 'DAY';
    const durationValue = 7;

    return {
      sessionTypeId,
      sessionTypeName: sessionType.name,
      unitLabel: sessionType.sessionUnit?.value ?? '',
      average: round1(average),
      frequency,
      durationUnit,
      durationValue,
      objectives: {
        easy: { level: 'easy', value: easy },
        normal: { level: 'normal', value: normal },
        challenge: { level: 'challenge', value: challenge },
      },
    };
  }

  /**
   * Enregistre un objectif à partir d’un niveau (easy/normal/challenge).
   * On recalcule les valeurs pour être cohérents.
   */
  async saveObjectiveFromLevel(sessionTypeId: string, level: ObjectiveLevel) {
    const proposal = await this.proposeForSessionType(sessionTypeId);
    const demoUser = await this.getDemoUser();

    const chosen =
      level === 'easy'
        ? proposal.objectives.easy
        : level === 'challenge'
          ? proposal.objectives.challenge
          : proposal.objectives.normal;

    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { sessionUnit: true },
    });

    if (!sessionType) {
      throw new NotFoundException('SessionType not found');
    }

    const objective = await this.prisma.objective.create({
      data: {
        userId: demoUser.id,
        sessionTypeId,
        sessionUnitId: sessionType.sessionUnit?.id ?? null,
        value: chosen.value,
        frequency: proposal.frequency,
        durationUnit: proposal.durationUnit,
        durationValue: proposal.durationValue,
      },
    });

    return {
      message: 'Objective created',
      level,
      objective,
    };
  }
}
