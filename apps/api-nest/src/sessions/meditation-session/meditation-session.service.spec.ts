import { BadRequestException } from "@nestjs/common";
import { MeditationSessionService } from "./meditation-session.service";

/**
 * Mock du Logger NestJS afin de supprimer les sorties de logs durant les tests unitaires.
 *
 * @remarks
 * Le resolver SoundCloud utilise le {@link Logger}. Les logs ne font pas partie
 * des objectifs de test.
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
 * Tests unitaires pour {@link MeditationSessionService}.
 *
 * @remarks
 * Ces tests valident le comportement du service sans accès réel à la base
 * de données ni intégration externe :
 * - validation du format de date,
 * - construction des requêtes Prisma (règles de compatibilité de durée),
 * - intégration SoundCloud via un resolver mocké.
 */
describe("MeditationSessionService", () => {
  /**
   * Crée une instance du service avec des dépendances mockées.
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

    const soundCloudResolver = {
      resolveStreamUrl: jest.fn(),
    };

    const service = new MeditationSessionService(
      prisma as any,
      soundCloudResolver as any,
    );

    return { service, prisma, soundCloudResolver };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
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
      expect(arg.data.endedAt.getTime()).toBe(
        arg.data.startedAt.getTime() + 300 * 1000,
      );
    });
  });

  describe("getMeditationContents", () => {
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

    it("does not call resolver when mediaUrl is already set", async () => {
      const { service, prisma, soundCloudResolver } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "Already has media",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: "https://example.com/file.mp3",
          soundcloudUrl: "https://soundcloud.com/artist/track",
        },
      ]);

      const result = await service.getMeditationContents("t1", 300);

      expect(soundCloudResolver.resolveStreamUrl).not.toHaveBeenCalled();
      expect(result[0].mediaUrl).toBe("https://example.com/file.mp3");
    });

    it("resolves SoundCloud when mediaUrl is missing and soundcloudUrl is set", async () => {
      const { service, prisma, soundCloudResolver } = makeService();

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

      soundCloudResolver.resolveStreamUrl.mockResolvedValue(
        "https://api.soundcloud.com/stream/abc?client_id=client_123",
      );

      const result = await service.getMeditationContents("t1", 300);

      expect(soundCloudResolver.resolveStreamUrl).toHaveBeenCalledWith(
        "https://soundcloud.com/artist/track",
      );
      expect(result[0].mediaUrl).toBe(
        "https://api.soundcloud.com/stream/abc?client_id=client_123",
      );
    });

    it("returns mediaUrl as null when resolver returns null", async () => {
      const { service, prisma, soundCloudResolver } = makeService();

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

      soundCloudResolver.resolveStreamUrl.mockResolvedValue(null);

      const result = await service.getMeditationContents("t1", 300);

      expect(result).toEqual([
        expect.objectContaining({
          id: "c1",
          mediaUrl: null,
        }),
      ]);
    });
  });
});
