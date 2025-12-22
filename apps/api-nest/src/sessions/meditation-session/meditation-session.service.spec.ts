import { BadRequestException } from "@nestjs/common";
import { of } from "rxjs";
import { MeditationSessionService } from "./meditation-session.service";

/**
 * Mock du Logger NestJS afin de supprimer les sorties de logs durant les tests unitaires.
 *
 * @remarks
 * Le {@link MeditationSessionService} utilise le {@link Logger} de NestJS en interne
 * pour signaler des avertissements et erreurs (par ex. variables d’environnement manquantes
 * comme `SOUNDCLOUD_CLIENT_ID`).
 *
 * Lors des tests unitaires, ces logs ne font pas partie des objectifs de test
 * et peuvent polluer la sortie, rendant les échecs plus difficiles à lire.
 *
 * Ce mock remplace la classe {@link Logger} par une implémentation silencieuse (no-op),
 * tout en conservant le reste du module `@nestjs/common`.
 */
jest.mock("@nestjs/common", () => {
  /**
   * Charge le module réel `@nestjs/common`.
   *
   * @remarks
   * Cela garantit que tous les décorateurs, exceptions et utilitaires fournis par NestJS
   * restent disponibles et se comportent normalement dans l’environnement de test.
   */
  const original = jest.requireActual("@nestjs/common");

  return {
    /**
     * Réexporte tous les symboles NestJS originaux, sauf ceux explicitement surchargés.
     */
    ...original,

    /**
     * Surcharge du {@link Logger} NestJS avec une implémentation silencieuse.
     *
     * @remarks
     * Chaque méthode de logging est volontairement implémentée comme un no-op.
     * Cela permet de conserver l’API du Logger tout en empêchant toute sortie de log
     * durant l’exécution des tests.
     *
     * L’objectif n’est pas de tester le logging, mais le comportement fonctionnel
     * du service testé.
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
 * Tests unitaires pour {@link MeditationSessionService}.
 *
 * @remarks
 * Ces tests valident le comportement du service sans aucun accès réel à la base de données
 * ni appel HTTP :
 * - validation du format de date et rejet des requêtes invalides,
 * - construction des requêtes Prisma (règles de compatibilité de durée),
 * - comportement de résolution SoundCloud selon la configuration runtime.
 *
 * Les dépendances PrismaService et HttpService sont mockées.
 */
describe("MeditationSessionService", () => {
  /**
   * Crée une instance du service avec des dépendances mockées.
   *
   * @remarks
   * Ce helper fournit un mock Prisma minimal contenant uniquement les méthodes
   * utilisées par les tests, ainsi qu’un mock minimal de HttpService.
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
     * Vérifie que le service rejette les chaînes de date invalides
     * avant toute interaction avec la persistance.
     *
     * @remarks
     * La méthode impose strictement le format `YYYY-MM-DD`
     * (et pas simplement une date parseable).
     * Ceci est important pour éviter des entrées utilisateur ambiguës
     * et des problèmes liés aux fuseaux horaires.
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
     * Vérifie que le service calcule correctement startedAt / endedAt
     * et appelle Prisma.create.
     *
     * @remarks
     * L’implémentation force l’heure à une valeur stable (12:00)
     * afin d’éviter les effets de bord liés aux fuseaux horaires
     * lorsqu’une date seule est fournie.
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
     * Vérifie que les règles de compatibilité de durée sont ajoutées
     * à la clause `where` Prisma lorsque durationSeconds > 0.
     *
     * @remarks
     * Cela démontre que la logique de filtrage est implémentée
     * au niveau du service et peut être validée en inspectant
     * les paramètres de requête Prisma.
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
     * Vérifie que si SOUNDCLOUD_CLIENT_ID n’est pas configuré,
     * le service n’effectue aucun appel réseau et retourne mediaUrl à null.
     *
     * @remarks
     * Cela garantit un comportement sûr dans les environnements
     * où l’intégration SoundCloud est désactivée ou non configurée.
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
     * Vérifie que lorsque SOUNDCLOUD_CLIENT_ID est configuré,
     * le service résout l’URL SoundCloud en URL de stream
     * et y ajoute le client id.
     *
     * @remarks
     * HttpService est mocké avec un observable RxJS afin de reproduire
     * le comportement de Nest Axios.
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

      expect(result[0].mediaUrl).toBe(
        "https://api.soundcloud.com/stream/abc?client_id=client_123",
      );
    });
  });
});
