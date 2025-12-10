import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BadgeMetricType, Prisma } from "@prisma/client";

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vérifie tous les badges actifs pour un user, et attribue ceux qui sont débloqués.
   * Retourne la liste des nouveaux badges gagnés (BadgeDefinition).
   */
  async checkForNewBadges(userId: string) {
    const allBadges = await this.prisma.badgeDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (!allBadges.length) return [];

    const alreadyEarned = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const earnedIds = new Set(alreadyEarned.map((b) => b.badgeId));

    const newlyEarned = [];

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      const metricValue = await this.computeMetric(userId, badge.metric);

      if (metricValue >= badge.threshold) {
        const userBadge = await this.prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            metricValueAtEarn: metricValue,
          },
        });

        newlyEarned.push({
          ...badge,
          userBadge,
        });
      }
    }

    return newlyEarned;
  }

  /**
   * Calcul des différentes métriques supportées par le système de badges.
   */
  private async computeMetric(
    userId: string,
    metric: BadgeMetricType
  ): Promise<number> {
    switch (metric) {
      case "TOTAL_MEDITATION_SESSIONS":
        return this.prisma.meditationSession.count({ where: { userId } });

      case "MEDITATION_STREAK_DAYS":
        return this.computeMeditationStreakDays(userId);

      case "TOTAL_EXERCICE_SESSIONS":
        return this.prisma.exerciceSession.count({ where: { userId } });

      case "TOTAL_SLEEP_NIGHTS":
        return this.prisma.sleepSession.count({ where: { userId } });

      case "TOTAL_SESSIONS_ANY": {
        const [med, ex, sleep] = await Promise.all([
          this.prisma.meditationSession.count({ where: { userId } }),
          this.prisma.exerciceSession.count({ where: { userId } }),
          this.prisma.sleepSession.count({ where: { userId } }),
        ]);
        return med + ex + sleep;
      }

      default:
        return 0;
    }
  }

  /**
   * Streak simple : nombre de jours consécutifs (en remontant depuis aujourd'hui)
   * avec au moins UNE méditation.
   *
   * MVP volontairement simple.
   */
  private async computeMeditationStreakDays(userId: string): Promise<number> {
    const sessions = await this.prisma.meditationSession.findMany({
      where: { userId },
      select: {
        startedAt: true,
        endedAt: true,
        createdAt: true,
      },
      orderBy: {
        // le plus récent d'abord
        createdAt: "desc",
      },
    });

    if (!sessions.length) return 0;

    // On normalise chaque session sur un "jour" (YYYY-MM-DD)
    const daysSet = new Set<string>();

    for (const s of sessions) {
      const date =
        s.startedAt ??
        s.endedAt ??
        s.createdAt; // fallback sur createdAt si besoin

      const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
      daysSet.add(dayKey);
    }

    // On compte les jours consécutifs à partir d'aujourd'hui
    let streak = 0;
    const today = new Date();

    // On part du jour courant et on recule
    while (true) {
      const d = new Date(today);
      d.setDate(today.getDate() - streak);
      const key = d.toISOString().slice(0, 10);

      if (daysSet.has(key)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Badges gagnés par un user (liste complète, par ex. pour une page "Mes badges").
   */
  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    });
  }

  /**
   * Badges mis en avant sur la home (avec logique d'expiration).
   * On limite à quelques badges récents (ex: 3).
   */
  /* TODO: faire un DTO !! */
  async getHighlightedBadges(userId: string, limit = 3) {
    const now = new Date();

    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            id: true,
            slug: true,
            titleKey: true,
            descriptionKey: true,
            iconKey: true,
            highlightDurationHours: true,
          },
        },
      },
      orderBy: { earnedAt: "desc" },
    });

    console.log(
      "[BadgesService] userBadges count=",
      userBadges.length,
      "for userId=",
      userId,
    );

    const visible = userBadges.filter((ub) => {
      const durationHours = ub.badge.highlightDurationHours;

      console.log(
        "[BadgesService] badge",
        ub.badge.slug,
        "durationHours=",
        durationHours,
      );

      if (!durationHours || durationHours <= 0) return false;

      const expiresAt = new Date(
        ub.earnedAt.getTime() + durationHours * 3600 * 1000,
      );
      return expiresAt > now;
    });

    console.log(
      "[BadgesService] visible badges after filter =",
      visible.length,
    );

    // ⬇️ On renvoie un objet "plat" avec iconKey au top-level
    return visible.slice(0, limit).map((ub) => ({
      id: ub.id,
      badgeId: ub.badgeId,
      earnedAt: ub.earnedAt, // ou .toISOString() si tu préfères
      slug: ub.badge.slug,
      titleKey: ub.badge.titleKey,
      descriptionKey: ub.badge.descriptionKey,
      iconKey: ub.badge.iconKey,
    }));
  }


}
