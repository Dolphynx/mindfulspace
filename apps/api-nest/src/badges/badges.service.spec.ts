import { Prisma } from "@prisma/client";
import { BadgesService } from "./badges.service";

/**
 * Mocks the NestJS Logger to avoid polluting unit test output.
 *
 * @remarks
 * {@link BadgesService} uses {@link Logger.debug} to trace badge filtering.
 * Logging is not part of the tested behavior; this mock keeps the output clean
 * while preserving the module exports from `@nestjs/common`.
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
 * Unit tests for {@link BadgesService}.
 *
 * @remarks
 * These tests validate service-level behavior without a real database:
 * - user badges retrieval with optional limit (and service clamping),
 * - highlighted badges filtering based on highlight duration,
 * - new badge attribution logic (including concurrency-safe behavior).
 *
 * Prisma is mocked via plain objects with `jest.fn()` methods.
 */
describe("BadgesService", () => {
  /**
   * Creates a service instance with a minimal Prisma mock.
   *
   * @remarks
   * Only the Prisma methods used by the service are exposed.
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
     * Ensures that when limit is undefined, the service does not apply `take`.
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
     * Ensures the service clamps the limit within [1..50] and passes it to Prisma `take`.
     */
    it("clamps limit to [1..50] and applies `take`", async () => {
      const { service, prisma } = makeService();
      prisma.userBadge.findMany.mockResolvedValue([]);

      await service.getUserBadges("usr_1", 999);

      const arg = prisma.userBadge.findMany.mock.calls[0][0];
      expect(arg.take).toBe(50);
    });

    /**
     * Ensures values below the minimum are clamped to the minimum.
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
     * Ensures the service defaults to 3 highlighted badges for compatibility when limit is undefined.
     *
     * @remarks
     * This preserves historical behavior while allowing an explicit `limit` in the query.
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
     * Ensures expired or non-highlightable badges are filtered out.
     *
     * @remarks
     * A badge is visible only if:
     * - highlightDurationHours is a positive number,
     * - earnedAt + highlightDurationHours is strictly after "now".
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
     * Ensures explicit limit is clamped within [1..20].
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
     * Ensures that if no active badge definitions exist, the service returns an empty list.
     */
    it("returns [] when no active badges exist", async () => {
      const { service, prisma } = makeService();

      prisma.badgeDefinition.findMany.mockResolvedValue([]);

      const result = await service.checkForNewBadges("usr_1");

      expect(result).toEqual([]);
      expect(prisma.userBadge.findMany).not.toHaveBeenCalled();
    });

    /**
     * Ensures the service does not attempt to award badges already earned.
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
     * Ensures a badge is awarded when the computed metric meets the threshold.
     *
     * @remarks
     * This test uses the "TOTAL_MEDITATION_SESSIONS" metric which maps to a Prisma count.
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

      prisma.userBadge.findMany.mockResolvedValue([]); // none earned yet
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
     * Ensures concurrency-safe behavior:
     * Prisma unique constraint violations (P2002) are ignored and do not fail the process.
     *
     * @remarks
     * The service may run concurrently (e.g., multiple requests). If two executions try to
     * create the same userBadge, Prisma can throw a P2002 error due to the @@unique constraint.
     * The service treats this as "already awarded" and continues without error.
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

      prisma.userBadge.findMany.mockResolvedValue([]); // none earned yet
      prisma.meditationSession.count.mockResolvedValue(10);

      prisma.userBadge.create.mockRejectedValue(makePrismaP2002Error());

      const result = await service.checkForNewBadges("usr_1");

      expect(result).toEqual([]);
    });

    /**
     * Ensures metric computation is performed once per unique metric type (anti N+1 optimization).
     *
     * @remarks
     * The service groups pending badges by `metric` and computes each metric only once,
     * then reuses the value for all badges sharing that metric.
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
 * Factory for a minimal badgeDefinition object as used by {@link BadgesService}.
 *
 * @remarks
 * The service requires: id, metric, threshold, isActive, sortOrder.
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
 * Factory for a minimal userBadge record including nested badge fields,
 * shaped like the Prisma include/select used in {@link BadgesService.getHighlightedBadges}.
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
 * Creates a Prisma-like P2002 error instance for concurrency tests.
 *
 * @remarks
 * The service checks:
 * - instance of {@link Prisma.PrismaClientKnownRequestError}
 * - error.code === "P2002"
 *
 * To keep this test independent from the Prisma runtime, we create an object whose
 * prototype matches PrismaClientKnownRequestError and set `code`.
 */
function makePrismaP2002Error(): Prisma.PrismaClientKnownRequestError {
  const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
  err.code = "P2002";
  return err as Prisma.PrismaClientKnownRequestError;
}
