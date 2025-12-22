import { BadRequestException } from "@nestjs/common";
import { of } from "rxjs";
import { MeditationSessionService } from "./meditation-session.service";

/**
 * Mocks the NestJS Logger to silence log output during unit tests.
 *
 * @remarks
 * The {@link MeditationSessionService} uses NestJS's {@link Logger} internally
 * to report warnings and errors (e.g. missing environment variables such as
 * `SOUNDCLOUD_CLIENT_ID`).
 *
 * During unit tests, this logging behavior is not part of the test objectives
 * and can pollute the test output, making failures harder to read.
 *
 * This mock replaces the {@link Logger} class with a no-op implementation,
 * while preserving the rest of the `@nestjs/common` module.
 */
jest.mock("@nestjs/common", () => {
  /**
   * Loads the real `@nestjs/common` module.
   *
   * @remarks
   * This ensures that all decorators, exceptions, and utilities provided by
   * NestJS remain available and behave as expected in the test environment.
   */
  const original = jest.requireActual("@nestjs/common");

  return {
    /**
     * Re-export all original NestJS symbols except those explicitly overridden.
     */
    ...original,

    /**
     * Overrides the NestJS {@link Logger} with a silent implementation.
     *
     * @remarks
     * Each logging method is intentionally implemented as a no-op.
     * This preserves the Logger API surface while preventing any
     * log output during test execution.
     *
     * The goal is not to test logging itself, but the functional
     * behavior of the service under test.
     */
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
 * Unit tests for {@link MeditationSessionService}.
 *
 * @remarks
 * These tests validate service-level behavior without any real database or HTTP calls:
 * - date format validation and request rejection,
 * - Prisma query construction (duration compatibility rules),
 * - SoundCloud resolution behavior depending on runtime configuration.
 *
 * The PrismaService and HttpService dependencies are mocked.
 */
describe("MeditationSessionService", () => {
  /**
   * Creates a service instance with mock dependencies.
   *
   * @remarks
   * This helper provides a minimal Prisma mock containing only the methods
   * used by the tests. It also provides a minimal HttpService mock.
   */
  function makeService() {
    const prisma = {
      meditationSession: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      meditationContent: {
        findMany: jest.fn(),
      },
      meditationType: {
        findMany: jest.fn(),
      },
    };

    const http = {
      get: jest.fn(),
    };

    const service = new MeditationSessionService(prisma as any, http as any);
    return { service, prisma, http };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.SOUNDCLOUD_CLIENT_ID;
  });

  describe("create", () => {
    /**
     * Ensures the service rejects invalid day strings before touching persistence.
     *
     * @remarks
     * The method enforces a strict `YYYY-MM-DD` format (not just a parseable date).
     * This is important to prevent ambiguous user inputs and timezone-dependent parsing.
     */
    it("throws BadRequestException when dateSession is not in YYYY-MM-DD format", async () => {
      const { service, prisma } = makeService();

      await expect(
        service.create("u1", {
          dateSession: "20/12/2025",
          meditationTypeId: "t1",
          durationSeconds: 60,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.meditationSession.create).not.toHaveBeenCalled();
    });

    /**
     * Ensures the service builds startedAt/endedAt and calls Prisma create.
     *
     * @remarks
     * The implementation forces the date time to a stable midday value (12:00)
     * to avoid timezone edge cases when only a day is supplied.
     */
    it("creates a session with computed startedAt and endedAt", async () => {
      const { service, prisma } = makeService();
      prisma.meditationSession.create.mockResolvedValue({ id: "s1" });

      await service.create("u1", {
        dateSession: "2025-12-20",
        meditationTypeId: "t1",
        durationSeconds: 300,
      } as any);

      expect(prisma.meditationSession.create).toHaveBeenCalled();

      const arg = prisma.meditationSession.create.mock.calls[0][0];
      expect(arg.data.userId).toBe("u1");
      expect(arg.data.meditationTypeId).toBe("t1");
      expect(arg.data.durationSeconds).toBe(300);

      expect(arg.data.startedAt).toBeInstanceOf(Date);
      expect(arg.data.endedAt).toBeInstanceOf(Date);
      expect(arg.data.endedAt.getTime()).toBe(arg.data.startedAt.getTime() + 300 * 1000);
    });
  });

  describe("getMeditationContents", () => {
    /**
     * Ensures duration compatibility rules are added to the Prisma where clause
     * when durationSeconds > 0.
     *
     * @remarks
     * This demonstrates that filtering logic is implemented at the service layer
     * and can be validated by inspecting the Prisma query input.
     */
    it("adds OR duration rules when durationSeconds > 0", async () => {
      const { service, prisma } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "Content A",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: "https://example.com/file.mp3",
          soundcloudUrl: null,
        },
      ]);

      await service.getMeditationContents("t1", 300);

      const arg = prisma.meditationContent.findMany.mock.calls[0][0];

      expect(arg.where.isActive).toBe(true);
      expect(arg.where.defaultMeditationTypeId).toBe("t1");
      expect(Array.isArray(arg.where.OR)).toBe(true);

      expect(arg.where.OR).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minDurationSeconds: { lte: 300 },
            maxDurationSeconds: { gte: 300 },
          }),
          expect.objectContaining({
            minDurationSeconds: null,
            maxDurationSeconds: { gte: 300 },
          }),
          expect.objectContaining({
            minDurationSeconds: { lte: 300 },
            maxDurationSeconds: null,
          }),
          expect.objectContaining({
            minDurationSeconds: null,
            maxDurationSeconds: null,
          }),
        ]),
      );
    });

    /**
     * Ensures that if SOUNDCLOUD_CLIENT_ID is not configured, the service does not
     * attempt network resolution and returns mediaUrl as null.
     *
     * @remarks
     * This verifies safe behavior in environments where SoundCloud integration
     * is intentionally disabled or not configured.
     */
    it("does not call HttpService when SoundCloud client id is missing", async () => {
      const { service, prisma, http } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "SoundCloud content",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: null,
          soundcloudUrl: "https://soundcloud.com/artist/track",
        },
      ]);

      const result = await service.getMeditationContents("t1", 300);

      expect(http.get).not.toHaveBeenCalled();
      expect(result).toEqual([
        expect.objectContaining({
          id: "c1",
          mediaUrl: null,
        }),
      ]);
    });

    /**
     * Ensures that when SOUNDCLOUD_CLIENT_ID is configured, the service resolves
     * a SoundCloud track URL into a stream URL and appends the client id.
     *
     * @remarks
     * The HttpService is mocked with an RxJS observable to match Nest Axios behavior.
     */
    it("resolves SoundCloud stream URL when client id is set", async () => {
      process.env.SOUNDCLOUD_CLIENT_ID = "client_123";

      const { service, prisma, http } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "SoundCloud content",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: null,
          soundcloudUrl: "https://soundcloud.com/artist/track",
        },
      ]);

      http.get.mockReturnValue(
        of({
          data: { stream_url: "https://api.soundcloud.com/stream/abc" },
        }),
      );

      const result = await service.getMeditationContents("t1", 300);

      expect(http.get).toHaveBeenCalledWith(
        "https://api.soundcloud.com/resolve",
        expect.objectContaining({
          params: {
            url: "https://soundcloud.com/artist/track",
            client_id: "client_123",
          },
        }),
      );

      expect(result[0].mediaUrl).toBe("https://api.soundcloud.com/stream/abc?client_id=client_123");
    });
  });
});
