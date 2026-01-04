import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Admin Service
 * Provides admin-specific business logic and statistics
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics for admin panel
   * Returns real data: user counts, resource counts, and session activity
   */
  async getDashboardStatistics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // === USER STATISTICS ===
    const totalUsers = await this.prisma.user.count();
    const usersThisMonth = await this.prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });
    const usersPreviousMonth = await this.prisma.user.count({
      where: {
        createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
      },
    });

    // Calculate growth percentage
    const usersGrowthPercent =
      usersPreviousMonth > 0
        ? Math.round(((usersThisMonth - usersPreviousMonth) / usersPreviousMonth) * 100)
        : usersThisMonth > 0
          ? 100
          : 0;

    // === RESOURCE STATISTICS ===
    const totalResources = await this.prisma.resource.count();
    const resourcesThisWeek = await this.prisma.resource.count({
      where: { createdAt: { gte: startOfWeek } },
    });

    // === SESSION STATISTICS (Combined: Meditation + Exercise + Sleep) ===
    const [totalMeditationSessions, totalExerciseSessions, totalSleepSessions] =
      await Promise.all([
        this.prisma.meditationSession.count(),
        this.prisma.exerciceSession.count(),
        this.prisma.sleepSession.count(),
      ]);

    const totalSessions =
      totalMeditationSessions + totalExerciseSessions + totalSleepSessions;

    const [sessionsToday] = await Promise.all([
      this.prisma.meditationSession.count({
        where: { createdAt: { gte: startOfToday } },
      }),
    ]);

    // Also count exercise and sleep sessions for today
    const [exerciseSessionsToday, sleepSessionsToday] = await Promise.all([
      this.prisma.exerciceSession.count({
        where: { dateCreated: { gte: startOfToday } },
      }),
      this.prisma.sleepSession.count({
        where: { dateCreated: { gte: startOfToday } },
      }),
    ]);

    const totalSessionsToday =
      sessionsToday + exerciseSessionsToday + sleepSessionsToday;

    return {
      users: {
        total: totalUsers,
        growthThisPeriod: usersThisMonth,
        growthPercent: usersGrowthPercent,
        growthLabel: 'thisMonth', // i18n key: dashboard.periods.thisMonth
      },
      resources: {
        total: totalResources,
        newThisPeriod: resourcesThisWeek,
        growthLabel: 'thisWeek', // i18n key: dashboard.periods.thisWeek
      },
      sessions: {
        total: totalSessions,
        breakdown: {
          meditation: totalMeditationSessions,
          exercise: totalExerciseSessions,
          sleep: totalSleepSessions,
        },
        newThisPeriod: totalSessionsToday,
        growthLabel: 'today', // i18n key: dashboard.periods.today
      },
    };
  }
}
