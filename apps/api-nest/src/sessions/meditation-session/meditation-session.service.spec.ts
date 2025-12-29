import { BadRequestException } from "@nestjs/common";
import { MeditationSessionService } from "./meditation-session.service";

/**
 * Mock du Logger NestJS afin de supprimer les sorties de logs durant les tests unitaires.
 *
 * @remarks
 * Les logs ne font pas partie des objectifs de test.
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
 * - résolution audio via un resolver mocké.
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

    const audioResolver = {
      resolveFromContent: jest.fn(),
    };

    const service = new MeditationSessionService(prisma as any, audioResolver as any);

    return { service, prisma, audioResolver };
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
      expect(arg.data.endedAt.getTime()).toBe(arg.data.startedAt.getTime() + 300 * 1000);
    });
  });

  describe("getMeditationContents", () => {
    it("builds Prisma OR duration rules when durationSeconds > 0", async () => {
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
          externalAudioProvider: null,
          externalAudioRef: null,
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

    it("selects external audio fields from Prisma (no legacy soundcloudUrl)", async () => {
      const { service, prisma } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([]);

      await service.getMeditationContents("t1", 300);

      const arg = prisma.meditationContent.findMany.mock.calls[0][0];
      expect(arg.select).toEqual(
        expect.objectContaining({
          mediaUrl: true,
          externalAudioProvider: true,
          externalAudioRef: true,
        }),
      );
      expect(arg.select).not.toHaveProperty("soundcloudUrl");
    });

    it("does not call audio resolver when mediaUrl is already set", async () => {
      const { service, prisma, audioResolver } = makeService();

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
          externalAudioProvider: "SOUNDCLOUD",
          externalAudioRef: "anything",
        },
      ]);

      const result = await service.getMeditationContents("t1", 300);

      expect(audioResolver.resolveFromContent).not.toHaveBeenCalled();
      expect(result[0].mediaUrl).toBe("https://example.com/file.mp3");
    });

    it("calls audio resolver when mediaUrl is missing and provider/ref are set", async () => {
      const { service, prisma, audioResolver } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "External content",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: null,
          externalAudioProvider: "AUDIUS",
          externalAudioRef: "track_123",
        },
      ]);

      audioResolver.resolveFromContent.mockResolvedValue(
        "https://example.com/resolved-stream.mp3",
      );

      const result = await service.getMeditationContents("t1", 300);

      expect(audioResolver.resolveFromContent).toHaveBeenCalledWith({
        mediaUrl: null,
        externalAudioProvider: "AUDIUS",
        externalAudioRef: "track_123",
      });

      expect(result[0].mediaUrl).toBe("https://example.com/resolved-stream.mp3");
    });

    it("returns mediaUrl as null when resolver returns null", async () => {
      const { service, prisma, audioResolver } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "External content",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: null,
          externalAudioProvider: "AUDIUS",
          externalAudioRef: "track_123",
        },
      ]);

      audioResolver.resolveFromContent.mockResolvedValue(null);

      const result = await service.getMeditationContents("t1", 300);

      expect(result).toEqual([
        expect.objectContaining({
          id: "c1",
          mediaUrl: null,
        }),
      ]);
    });

    it("does not call audio resolver when mediaUrl is missing but provider/ref are missing", async () => {
      const { service, prisma, audioResolver } = makeService();

      prisma.meditationContent.findMany.mockResolvedValue([
        {
          id: "c1",
          title: "No media and no provider",
          description: null,
          mode: "AUDIO",
          defaultDurationSeconds: 300,
          defaultMeditationTypeId: "t1",
          isPremium: false,
          mediaUrl: null,
          externalAudioProvider: null,
          externalAudioRef: null,
        },
      ]);

      const result = await service.getMeditationContents("t1", 300);

      expect(audioResolver.resolveFromContent).not.toHaveBeenCalled();
      expect(result[0].mediaUrl).toBeNull();
    });
  });
});
