import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BadgeMetricType } from "@prisma/client";
import { HighlightedBadgeDto, UserBadgeDto } from "./dto/badges.dto";

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Évalue l'ensemble des badges actifs pour un utilisateur et attribue
   * ceux dont les critères sont remplis.
   *
   * @param userId - Identifiant de l'utilisateur.
   * @returns Liste des nouveaux badges gagnés (badgeDefinition + userBadge).
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
      // Badge déjà obtenu, on passe au suivant.
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
   * Calcule la valeur courante d'une métrique de badge pour un utilisateur.
   *
   * @param userId - Identifiant de l'utilisateur.
   * @param metric - Type de métrique à calculer.
   * @returns Valeur numérique de la métrique.
   */
  private async computeMetric(
    userId: string,
    metric: BadgeMetricType,
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
   * Calcule le nombre de jours consécutifs de méditation à partir de la date courante,
   * en considérant les jours comportant au moins une session de méditation.
   *
   * @param userId - Identifiant de l'utilisateur.
   * @returns Longueur de la série de jours consécutifs.
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
        createdAt: "desc",
      },
    });

    if (!sessions.length) return 0;

    // Ensemble des jours distincts comportant au moins une session.
    const daysSet = new Set<string>();

    for (const s of sessions) {
      const date = s.startedAt ?? s.endedAt ?? s.createdAt;
      const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
      daysSet.add(dayKey);
    }

    let streak = 0;
    const today = new Date();

    // Parcours des jours en remontant depuis aujourd'hui
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
   * Récupère l'ensemble des badges gagnés par un utilisateur.
   *
   * @param userId - Identifiant de l'utilisateur.
   * @returns Liste des badges utilisateur, triés par date d'obtention décroissante.
   */
  getUserBadges(userId: string, limit?: number): Promise<UserBadgeDto[]> {
    const safeLimit = clampLimit(limit, undefined, 1, 50); // undefined => pas de take
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      ...(safeLimit ? { take: safeLimit } : {}),
    }) as unknown as Promise<UserBadgeDto[]>;
  }

  /**
   * Récupère les badges récents d'un utilisateur destinés à être mis en avant.
   * Seuls les badges dont la durée de mise en avant n'est pas expirée sont retournés.
   *
   * Compatibilité :
   * - `limit` absent / undefined => comportement historique : 3
   * - `limit` présent => clamp (1..20) puis apply
   *
   * @param userId - Identifiant de l'utilisateur.
   * @param limit - Nombre maximum de badges à retourner.
   * @returns Liste des badges mis en avant, dans un format aplati.
   */
  async getHighlightedBadges(
    userId: string,
    limit?: number,
  ): Promise<HighlightedBadgeDto[]> {
    const now = new Date();

    const safeLimit = clampLimit(limit, 3, 1, 20);

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

    // NOTE: logs utiles en dev, à retirer en prod si besoin
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

    return visible.slice(0, safeLimit).map(
      (ub): HighlightedBadgeDto => ({
        id: ub.id,
        badgeId: ub.badgeId,
        earnedAt: ub.earnedAt,
        slug: ub.badge.slug,
        titleKey: ub.badge.titleKey,
        descriptionKey: ub.badge.descriptionKey,
        iconKey: ub.badge.iconKey,
      }),
    );
  }
}

/**
 * Applique un clamp au paramètre `limit` en garantissant :
 * - une valeur par défaut si undefined / NaN / <=0
 * - un minimum et un maximum
 *
 * @param limit - Valeur candidate.
 * @param defaultValue - Valeur de repli.
 * @param min - Minimum autorisé.
 * @param max - Maximum autorisé.
 * @returns Une valeur sûre pour l’API.
 */
function clampLimit(
  limit: number | undefined,
  defaultValue: number | undefined,
  min: number,
  max: number,
): number | undefined {
  if (limit === undefined || Number.isNaN(limit)) return defaultValue;
  if (limit < min) return min;
  if (limit > max) return max;
  return limit;
}
