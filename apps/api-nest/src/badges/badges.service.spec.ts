import { Prisma } from "@prisma/client";
import { BadgesService } from "./badges.service";

/**
 * Mock du Logger NestJS afin d’éviter de polluer la sortie des tests unitaires.
 *
 * @remarks
 * {@link BadgesService} utilise {@link Logger.debug} pour tracer le filtrage des badges.
 * Le logging ne fait pas partie du comportement testé ; ce mock permet de garder
 * une sortie propre tout en conservant les exports du module `@nestjs/common`.
 */
jest.mock("@nestjs/common", () => {
  const original = jest.requireActual("@nestjs/common");
  return {
    ...original,
    Logger: class {
      warn(): void {}
      error(): void {}
      log(): void {}
      debug(): void {}
      verbose(): void {}
    },
  };
});

/**
 * Tests unitaires pour {@link BadgesService}.
 *
 * @remarks
 * Ces tests valident le comportement du service sans base de données réelle :
 * - récupération des badges utilisateur avec limite optionnelle (et bornage côté service),
 * - filtrage des badges mis en avant selon leur durée de mise en avant,
 * - logique d’attribution de nouveaux badges (y compris en cas de concurrence).
 *
 * Prisma est mocké via de simples objets contenant des méthodes `jest.fn()`.
 */
describe("BadgesService", () => {
  /**
   * Crée une instance du service avec un mock Prisma minimal.
   *
   * @remarks
   * Seules les méthodes Prisma utilisées par le service sont exposées.
   */
  function makeService() {
    const prisma = {
      badgeDefinition: {
        findMany: jest.fn(),
      },
      userBadge: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      meditationSession: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      exerciceSession: {
        count: jest.fn(),
      },
      sleepSession: {
        count: jest.fn(),
      },
    };

    const service = new BadgesService(prisma as any);
    return { service, prisma };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getUserBadges", () => {
    /**
     * Vérifie que lorsque la limite est undefined, le service n’applique pas `take`.
     */
    it("does not apply `take` when limit is undefined", async () => {
      const { service, prisma } = makeService();
      prisma.userBadge.findMany.mockResolvedValue([]);

      await service.getUserBadges("usr_1", undefined);

      expect(prisma.userBadge.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "usr_1" },
          orderBy: { earnedAt: "desc" },
        }),
      );

      const arg = prisma.userBadge.findMany.mock.calls[0][0];
      expect(arg.take).toBeUndefined();
    });

    /**
     * Vérifie que le service borne la limite dans l’intervalle [1..50]
     * et la transmet à Prisma via `take`.
     */
    it("clamps limit to [1..50] and applies `take`", async () => {
      const { service, prisma } = makeService();
      prisma.userBadge.findMany.mockResolvedValue([]);

      await service.getUserBadges("usr_1", 999);

      const arg = prisma.userBadge.findMany.mock.calls[0][0];
      expect(arg.take).toBe(50);
    });

    /**
     * Vérifie que les valeurs inférieures au minimum sont bornées à 1.
     */
    it("clamps limit below minimum to 1", async () => {
      const { service, prisma } = makeService();
      prisma.userBadge.findMany.mockResolvedValue([]);

      await service.getUserBadges("usr_1", 0);

      const arg = prisma.userBadge.findMany.mock.calls[0][0];
      expect(arg.take).toBe(1);
    });
  });

  describe("getHighlightedBadges", () => {
    /**
     * Vérifie que le service utilise une valeur par défaut de 3 badges mis en avant
     * lorsque la limite est undefined, pour des raisons de compatibilité.
     *
     * @remarks
     * Cela préserve le comportement historique tout en permettant
     * un `limit` explicite dans la query.
     */
    it("defaults to 3 when limit is undefined", async () => {
      const { service, prisma } = makeService();

      const now = new Date();
      const earnedAt = new Date(now.getTime() - 1 * 3600 * 1000);

      prisma.userBadge.findMany.mockResolvedValue([
        makeUserBadge({
          id: "ub1",
          badgeId: "b1",
          earnedAt,
          slug: "s1",
          highlightDurationHours: 24,
        }),
        makeUserBadge({
          id: "ub2",
          badgeId: "b2",
          earnedAt,
          slug: "s2",
          highlightDurationHours: 24,
        }),
        makeUserBadge({
          id: "ub3",
          badgeId: "b3",
          earnedAt,
          slug: "s3",
          highlightDurationHours: 24,
        }),
        makeUserBadge({
          id: "ub4",
          badgeId: "b4",
          earnedAt,
          slug: "s4",
          highlightDurationHours: 24,
        }),
      ]);

      const result = await service.getHighlightedBadges("usr_1", undefined);

      expect(result).toHaveLength(3);
      expect(result.map((x) => x.id)).toEqual(["ub1", "ub2", "ub3"]);
    });

    /**
     * Vérifie que les badges expirés ou non éligibles à la mise en avant sont filtrés.
     *
     * @remarks
     * Un badge est visible uniquement si :
     * - highlightDurationHours est un nombre strictement positif,
     * - earnedAt + highlightDurationHours est strictement postérieur à “maintenant”.
     */
    it("filters out badges with no duration, non-positive duration, or expired duration", async () => {
      const { service, prisma } = makeService();

      const now = new Date();
      const recent = new Date(now.getTime() - 1 * 3600 * 1000);
      const tooOld = new Date(now.getTime() - 10 * 3600 * 1000);

      prisma.userBadge.findMany.mockResolvedValue([
        makeUserBadge({
          id: "ub_no_duration",
          badgeId: "b1",
          earnedAt: recent,
          slug: "no-duration",
          highlightDurationHours: null,
        }),
        makeUserBadge({
          id: "ub_zero",
          badgeId: "b2",
          earnedAt: recent,
          slug: "zero",
          highlightDurationHours: 0,
        }),
        makeUserBadge({
          id: "ub_expired",
          badgeId: "b3",
          earnedAt: tooOld,
          slug: "expired",
          highlightDurationHours: 2,
        }),
        makeUserBadge({
          id: "ub_visible",
          badgeId: "b4",
          earnedAt: recent,
          slug: "visible",
          highlightDurationHours: 24,
        }),
      ]);

      const result = await service.getHighlightedBadges("usr_1", 10);

      expect(result).toEqual([
        expect.objectContaining({
          id: "ub_visible",
          slug: "visible",
        }),
      ]);
    });

    /**
     * Vérifie que la limite explicite est bornée dans l’intervalle [1..20].
     */
    it("clamps highlighted limit to [1..20]", async () => {
      const { service, prisma } = makeService();

      const now = new Date();
      const earnedAt = new Date(now.getTime() - 1 * 3600 * 1000);

      prisma.userBadge.findMany.mockResolvedValue(
        Array.from({ length: 30 }).map((_, i) =>
          makeUserBadge({
            id: `ub_${i + 1}`,
            badgeId: `b_${i + 1}`,
            earnedAt,
            slug: `slug_${i + 1}`,
            highlightDurationHours: 24,
          }),
        ),
      );

      const result = await service.getHighlightedBadges("usr_1", 999);
      expect(result).toHaveLength(20);
    });
  });

  describe("checkForNewBadges", () => {
    /**
     * Vérifie que si aucune définition de badge active n’existe,
     * le service retourne une liste vide.
     */
    it("returns [] when no active badges exist", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([]);

      const result = await service.checkForNewBadges("usr_1");

      expect(result).toEqual([]);
      expect(prisma.userBadge.findMany).not.toHaveBeenCalled();
    });

    /**
     * Vérifie que le service n’essaie pas d’attribuer des badges déjà obtenus.
     */
    it("returns [] when all active badges are already earned", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([
        makeBadgeDefinition({
          id: "bdg_1",
          metric: "TOTAL_MEDITATION_SESSIONS",
          threshold: 1,
        }),
      ]);

      prisma.userBadge.findMany.mockResolvedValue([{ badgeId: "bdg_1" }]);

      const result = await service.checkForNewBadges("usr_1");

      expect(result).toEqual([]);
      expect(prisma.userBadge.create).not.toHaveBeenCalled();
    });

    /**
     * Vérifie qu’un badge est attribué lorsque la valeur du métrique
     * atteint ou dépasse le seuil.
     *
     * @remarks
     * Ce test utilise le métrique "TOTAL_MEDITATION_SESSIONS"
     * qui correspond à un `count` Prisma.
     */
    it("awards a badge when metric value meets threshold", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([
        makeBadgeDefinition({
          id: "bdg_1",
          metric: "TOTAL_MEDITATION_SESSIONS",
          threshold: 2,
        }),
      ]);

      prisma.userBadge.findMany.mockResolvedValue([]); // aucun badge encore obtenu
      prisma.meditationSession.count.mockResolvedValue(3);

      prisma.userBadge.create.mockResolvedValue({
        id: "ub_1",
        userId: "usr_1",
        badgeId: "bdg_1",
        metricValueAtEarn: 3,
        earnedAt: new Date(),
      });

      const result = await service.checkForNewBadges("usr_1");

      expect(prisma.userBadge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "usr_1",
            badgeId: "bdg_1",
            metricValueAtEarn: 3,
          }),
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "bdg_1",
          userBadge: expect.objectContaining({ id: "ub_1" }),
        }),
      );
    });

    /**
     * Vérifie un comportement sûr en cas de concurrence :
     * les violations de contrainte unique Prisma (P2002)
     * sont ignorées et ne provoquent pas d’échec.
     *
     * @remarks
     * Le service peut être exécuté en parallèle (ex. plusieurs requêtes).
     * Si deux exécutions tentent de créer le même userBadge,
     * Prisma peut lever une erreur P2002 liée à la contrainte @@unique.
     * Le service interprète cela comme “déjà attribué” et continue sans erreur.
     */
    it("ignores Prisma P2002 errors during badge creation", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([
        makeBadgeDefinition({
          id: "bdg_1",
          metric: "TOTAL_MEDITATION_SESSIONS",
          threshold: 1,
        }),
      ]);

      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.meditationSession.count.mockResolvedValue(10);

      prisma.userBadge.create.mockRejectedValue(makePrismaP2002Error());

      const result = await service.checkForNewBadges("usr_1");

      expect(result).toEqual([]);
    });

    /**
     * Vérifie que chaque métrique est calculé une seule fois
     * même si plusieurs badges en attente partagent le même métrique
     * (optimisation anti N+1).
     *
     * @remarks
     * Le service regroupe les badges en attente par `metric`
     * et calcule chaque métrique une seule fois,
     * puis réutilise la valeur pour tous les badges correspondants.
     */
    it("computes each metric only once even when multiple pending badges share the same metric", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([
        makeBadgeDefinition({
          id: "bdg_a",
          metric: "TOTAL_MEDITATION_SESSIONS",
          threshold: 1,
        }),
        makeBadgeDefinition({
          id: "bdg_b",
          metric: "TOTAL_MEDITATION_SESSIONS",
          threshold: 2,
        }),
      ]);

      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.meditationSession.count.mockResolvedValue(10);

      prisma.userBadge.create.mockResolvedValue({
        id: "ub_x",
        userId: "usr_1",
        badgeId: "bdg_a",
        metricValueAtEarn: 10,
        earnedAt: new Date(),
      });

      await service.checkForNewBadges("usr_1");

      expect(prisma.meditationSession.count).toHaveBeenCalledTimes(1);
      expect(prisma.userBadge.create).toHaveBeenCalledTimes(2);
    });
  });
});

/**
 * Factory permettant de créer un objet badgeDefinition minimal,
 * tel qu’utilisé par {@link BadgesService}.
 *
 * @remarks
 * Le service requiert : id, metric, threshold, isActive, sortOrder.
 */
function makeBadgeDefinition(input: {
  id: string;
  metric: any;
  threshold: number;
}) {
  return {
    id: input.id,
    metric: input.metric,
    threshold: input.threshold,
    isActive: true,
    sortOrder: 1,
    slug: `slug_${input.id}`,
    titleKey: `badges.${input.id}.title`,
    descriptionKey: null,
    iconKey: null,
    highlightDurationHours: 24,
  };
}

/**
 * Factory permettant de créer un enregistrement userBadge minimal
 * incluant les champs imbriqués du badge,
 * conforme au include/select Prisma utilisé dans
 * {@link BadgesService.getHighlightedBadges}.
 */
function makeUserBadge(input: {
  id: string;
  userId?: string;
  badgeId: string;
  earnedAt: Date;
  slug: string;
  highlightDurationHours: number | null;
}) {
  return {
    id: input.id,
    userId: input.userId ?? "usr_1",
    badgeId: input.badgeId,
    earnedAt: input.earnedAt,
    metricValueAtEarn: 0,
    badge: {
      id: input.badgeId,
      slug: input.slug,
      titleKey: `badges.${input.slug}.title`,
      descriptionKey: null,
      iconKey: null,
      highlightDurationHours: input.highlightDurationHours,
    },
  };
}

/**
 * Crée une instance d’erreur Prisma de type P2002,
 * utilisée pour les tests de concurrence.
 *
 * @remarks
 * Le service vérifie :
 * - instance de {@link Prisma.PrismaClientKnownRequestError}
 * - error.code === "P2002"
 *
 * Afin de garder ce test indépendant du runtime Prisma,
 * on crée un objet dont le prototype correspond à
 * PrismaClientKnownRequestError et on définit `code`.
 */
function makePrismaP2002Error(): Prisma.PrismaClientKnownRequestError {
  const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
  err.code = "P2002";
  return err as Prisma.PrismaClientKnownRequestError;
}
