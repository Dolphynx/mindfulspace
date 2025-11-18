/**
 * ObjectivesService
 * -----------------
 * Service responsable de toute la logique métier liée aux objectifs
 * pour l’utilisateur de démonstration (demo user).
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectiveDurationUnit, ObjectiveFrequency } from '@prisma/client';
import type { ObjectiveLevel } from './objectives.types';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère le user de démo à partir de l’email configuré.
   */
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
   * Récupère, pour un type de session donné, le lien SessionTypeUnit prioritaire
   * (priority ASC) avec l’unité correspondante.
   *
   * C’est aligné avec le message de ton collègue :
   * "il prend le premier dans la table après les avoir triés par ordre de priorité".
   */
  private async getPrimaryUnitForSessionType(sessionTypeId: string) {
    return this.prisma.sessionTypeUnit.findFirst({
      where: { sessionTypeId },
      include: { sessionUnit: true },
      orderBy: { priority: 'asc' },
    });
  }

  /**
   * Indique si le user de démo possède au moins une session encodée.
   */
  async hasSessionsForDemoUser() {
    const demoUser = await this.getDemoUser();

    const count = await this.prisma.session.count({
      where: { userId: demoUser.id },
    });

    return { hasSessions: count > 0 };
  }

  /**
   * Retourne tous les objectifs du user de démo.
   * On inclut :
   * - le type de session
   * - l’unité réellement stockée dans l’objectif (sessionUnit)
   */
  async getObjectivesForDemoUser() {
    const demoUser = await this.getDemoUser();

    const objectives = await this.prisma.objective.findMany({
      where: {
        userId: demoUser.id,
      },
      include: {
        sessionType: true,
        SessionUnit: true,
      },
    });

    return objectives.map((o) => ({
      id: o.id,
      sessionTypeId: o.sessionTypeId,
      sessionTypeName: o.sessionType?.name ?? 'Type de session',
      // Label de l’unité utilisée pour cet objectif
      unitLabel: o.SessionUnit?.value ?? '',
      value: o.value,
      frequency: o.frequency,
      durationUnit: o.durationUnit,
      durationValue: o.durationValue,
    }));
  }

  /**
   * Propose des objectifs pour un type de session donné.
   * - calcule la moyenne sur les 14 derniers jours
   * - utilise l’unité prioritaire du type (SessionTypeUnit.priority = 1)
   */
  async proposeForSessionType(sessionTypeId: string) {
    if (!sessionTypeId) {
      throw new BadRequestException('sessionTypeId is required');
    }

    const demoUser = await this.getDemoUser();

    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
    });

    if (!sessionType) {
      throw new NotFoundException('SessionType not found');
    }

    // Récupérer l’unité prioritaire pour ce type de session
    const primaryUnit = await this.getPrimaryUnitForSessionType(sessionTypeId);

    const unitLabel = primaryUnit?.sessionUnit?.value ?? '';

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

    const round1 = (value: number) => Math.round(value * 10) / 10;
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
      unitLabel,
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
   * Enregistre un objectif à partir d’un niveau (easy / normal / challenge).
   * - recalcule la proposition
   * - choisit la valeur selon le niveau
   * - stocke l’unité prioritaire dans sessionUnitId
   */
  async saveObjectiveFromLevel(
    sessionTypeId: string,
    level: ObjectiveLevel,
  ) {
    const proposal = await this.proposeForSessionType(sessionTypeId);
    const demoUser = await this.getDemoUser();

    const chosen =
      level === 'easy'
        ? proposal.objectives.easy
        : level === 'challenge'
          ? proposal.objectives.challenge
          : proposal.objectives.normal;

    // Récupérer à nouveau l’unité prioritaire pour stocker son id
    const primaryUnit = await this.getPrimaryUnitForSessionType(sessionTypeId);

    const objective = await this.prisma.objective.create({
      data: {
        userId: demoUser.id,
        sessionTypeId,
        sessionUnitId: primaryUnit?.sessionUnitId ?? null,
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
