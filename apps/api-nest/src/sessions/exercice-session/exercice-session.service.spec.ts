import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ExerciceSessionService } from "./exercice-session.service";
import { pickTranslation } from "../../common/utils/i18n";

/**
 * On mock pickTranslation pour éviter de dépendre de l'implémentation réelle.
 *
 * @remarks
 * Ici on veut uniquement vérifier que le service utilise le résultat
 * pour mapper le nom de l'exercice (normalizeSession).
 */
jest.mock("@mindfulspace/api/common/utils/i18n", () => ({
  pickTranslation: jest.fn(),
}));

/**
 * Tests unitaires du {@link ExerciceSessionService}.
 *
 * @remarks
 * Ces tests valident la logique du service sans accès réel à la base :
 * - validation d'entrée (exercices obligatoires, IDs existants),
 * - "upsert logique" sur une journée (update si session existante ce jour-là),
 * - ownership / erreurs métier dans findOne,
 * - construction des filtres de date (bornes de journée) pour getSessionsBetweenDates,
 * - résumé d'hier avec structure vide si absent.
 *
 * Prisma est mocké via des objets simples exposant les méthodes utilisées.
 *
 * ⚠️ Note importante "dates" :
 * Le service renvoie `date: start.toISOString().split("T")[0]`.
 * Comme `start` est fixé à minuit en heure locale, la conversion ISO (UTC)
 * peut faire basculer au jour précédent (ex: Paris 00:00 => 23:00Z la veille).
 * Les tests doivent donc calculer l'attendu avec la même logique.
 */
describe("ExerciceSessionService", () => {
  /**
   * Fabrique un service avec un mock Prisma minimal et configurable.
   */
  function makeService() {
    const prisma = {
      exerciceContent: {
        findMany: jest.fn(),
      },
      exerciceSession: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const service = new ExerciceSessionService(prisma as any);
    return { service, prisma };
  }

  /**
   * Construit une session Prisma "riche" (avec relations) pour normalisation.
   */
  function makeRawSession(input?: Partial<any>) {
    return {
      id: input?.id ?? "sess-1",
      userId: input?.userId ?? "user-1",
      dateSession: input?.dateSession ?? new Date("2025-12-01T10:15:00.000Z"),
      quality: input?.quality ?? 3,
      exerciceSerie:
        input?.exerciceSerie ??
        [
          {
            exerciceContentId: "c1",
            repetitionCount: 10,
            exerciceContent: {
              translations: [{ lang: "fr", name: "Pompes" }],
            },
          },
        ],
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (pickTranslation as jest.Mock).mockImplementation(
      (translations: any[], lang: string) => {
        // Impl ultra-simple : retourne la traduction correspondant à la langue,
        // sinon fallback sur la première.
        return translations?.find((t) => t?.lang === lang) ?? translations?.[0] ?? null;
      },
    );
  });

  describe("create", () => {
    it("lève BadRequestException si aucun exercice n'est fourni", async () => {
      const { service, prisma } = makeService();

      await expect(
        service.create("user-1", {
          dateSession: "2025-12-01",
          quality: 2,
          exercices: [],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      // Dans ce cas, on ne touche même pas Prisma.
      expect(prisma.exerciceContent.findMany).not.toHaveBeenCalled();
      expect(prisma.exerciceSession.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("lève BadRequestException si un exerciceContentId est invalide", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceContent.findMany.mockResolvedValue([{ id: "valid-1" }]);

      await expect(
        service.create("user-1", {
          dateSession: "2025-12-01",
          exercices: [
            { exerciceContentId: "valid-1", repetitionCount: 10 },
            { exerciceContentId: "missing-2", repetitionCount: 5 },
          ],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.exerciceContent.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.exerciceSession.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("si une session existe déjà ce jour-là, fait un update puis upsert les séries", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceContent.findMany.mockResolvedValue([{ id: "c1" }, { id: "c2" }]);

      // session existante trouvée via findFirst (sur bornes de journée)
      prisma.exerciceSession.findFirst.mockResolvedValue({
        id: "existing-session",
        quality: 1,
      });

      const tx = {
        exerciceSession: {
          update: jest.fn(),
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        exerciceSerie: {
          upsert: jest.fn(),
        },
      };

      tx.exerciceSession.update.mockResolvedValue({ id: "existing-session" });

      const full = makeRawSession({
        id: "existing-session",
        dateSession: new Date("2025-12-01T12:00:00.000Z"),
        exerciceSerie: [
          {
            exerciceContentId: "c1",
            repetitionCount: 10,
            exerciceContent: { translations: [{ lang: "fr", name: "Pompes" }] },
          },
          {
            exerciceContentId: "c2",
            repetitionCount: 20,
            exerciceContent: { translations: [{ lang: "fr", name: "Squats" }] },
          },
        ],
      });
      tx.exerciceSession.findUnique.mockResolvedValue(full);

      prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      const dto = {
        dateSession: "2025-12-01",
        quality: 4,
        exercices: [
          { exerciceContentId: "c1", repetitionCount: 10 },
          { exerciceContentId: "c2", repetitionCount: 20 },
        ],
      };

      const result = await service.create("user-1", dto as any);

      expect(tx.exerciceSession.update).toHaveBeenCalledTimes(1);
      expect(tx.exerciceSession.create).not.toHaveBeenCalled();

      expect(tx.exerciceSerie.upsert).toHaveBeenCalledTimes(2);

      expect(tx.exerciceSession.findUnique).toHaveBeenCalledWith({
        where: { id: "existing-session" },
        include: expect.any(Object),
      });

      expect(result).toBe(full);

      const whereArg = prisma.exerciceSession.findFirst.mock.calls[0][0].where;
      expect(whereArg.userId).toBe("user-1");
      expect(whereArg.dateSession.gte).toBeInstanceOf(Date);
      expect(whereArg.dateSession.lte).toBeInstanceOf(Date);
      expect(whereArg.dateSession.gte.getHours()).toBe(0);
      expect(whereArg.dateSession.gte.getMinutes()).toBe(0);
      expect(whereArg.dateSession.lte.getHours()).toBe(23);
      expect(whereArg.dateSession.lte.getMinutes()).toBe(59);
    });

    it("si aucune session n'existe ce jour-là, crée la session puis upsert les séries", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceContent.findMany.mockResolvedValue([{ id: "c1" }]);
      prisma.exerciceSession.findFirst.mockResolvedValue(null);

      const tx = {
        exerciceSession: {
          update: jest.fn(),
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        exerciceSerie: {
          upsert: jest.fn(),
        },
      };

      tx.exerciceSession.create.mockResolvedValue({ id: "new-session" });

      const full = makeRawSession({
        id: "new-session",
        dateSession: new Date("2025-12-01T08:00:00.000Z"),
      });
      tx.exerciceSession.findUnique.mockResolvedValue(full);

      prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      const dto = {
        dateSession: "2025-12-01",
        quality: 2,
        exercices: [{ exerciceContentId: "c1", repetitionCount: 15 }],
      };

      const result = await service.create("user-1", dto as any);

      expect(tx.exerciceSession.create).toHaveBeenCalledTimes(1);
      expect(tx.exerciceSession.update).not.toHaveBeenCalled();
      expect(tx.exerciceSerie.upsert).toHaveBeenCalledTimes(1);
      expect(result).toBe(full);
    });
  });

  describe("findOne", () => {
    it("lève NotFoundException si la session n'existe pas", async () => {
      const { service, prisma } = makeService();
      prisma.exerciceSession.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne("sess-x", "user-1", { lang: "en" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("lève ForbiddenException si la session n'appartient pas à l'utilisateur", async () => {
      const { service, prisma } = makeService();
      prisma.exerciceSession.findUnique.mockResolvedValue(
        makeRawSession({ userId: "other-user" }),
      );

      await expect(
        service.findOne("sess-1", "user-1", { lang: "en" }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("retourne une session normalisée (date YYYY-MM-DD, exercices mappés)", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceSession.findUnique.mockResolvedValue(
        makeRawSession({
          id: "sess-1",
          userId: "user-1",
          dateSession: new Date("2025-12-01T10:15:00.000Z"),
          exerciceSerie: [
            {
              exerciceContentId: "c1",
              repetitionCount: 10,
              exerciceContent: { translations: [{ lang: "fr", name: "Pompes" }] },
            },
          ],
        }),
      );

      const out = await service.findOne("sess-1", "user-1", { lang: "fr" });

      expect(out).toEqual({
        id: "sess-1",
        date: "2025-12-01",
        quality: 3,
        exercices: [
          {
            exerciceContentId: "c1",
            exerciceContentName: "Pompes",
            repetitionCount: 10,
          },
        ],
      });

      expect(pickTranslation).toHaveBeenCalled();
    });
  });

  describe("getSessionsBetweenDates", () => {
    it("construit correctement les bornes (from à 00:00, to à 23:59) et appelle Prisma", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceSession.findMany.mockResolvedValue([
        makeRawSession({
          dateSession: new Date("2025-12-02T12:00:00.000Z"),
        }),
      ]);

      await service.getSessionsBetweenDates(
        "user-1",
        { from: "2025-12-01", to: "2025-12-10" },
        { lang: "en" },
      );

      const call = prisma.exerciceSession.findMany.mock.calls[0][0];

      expect(call.where.userId).toBe("user-1");
      expect(call.where.dateSession.gte).toBeInstanceOf(Date);
      expect(call.where.dateSession.lte).toBeInstanceOf(Date);

      expect(call.where.dateSession.gte.getHours()).toBe(0);
      expect(call.where.dateSession.gte.getMinutes()).toBe(0);

      expect(call.where.dateSession.lte.getHours()).toBe(23);
      expect(call.where.dateSession.lte.getMinutes()).toBe(59);

      expect(call.orderBy).toEqual({ dateSession: "asc" });
      expect(call.include).toBeDefined();
    });

    it("si aucune borne n'est donnée, n'ajoute pas dateSession au where", async () => {
      const { service, prisma } = makeService();

      prisma.exerciceSession.findMany.mockResolvedValue([makeRawSession()]);

      await service.getSessionsBetweenDates("user-1", {}, { lang: "en" });

      const call = prisma.exerciceSession.findMany.mock.calls[0][0];
      expect(call.where.userId).toBe("user-1");
      expect(call.where.dateSession).toBeUndefined();
    });
  });

  describe("getYesterdaySummary", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it("si aucune session hier => retourne une structure vide stable (date calculée comme le service)", async () => {
      const { service, prisma } = makeService();

      // On fige le temps pour rendre le test déterministe.
      // ⚠️ La date renvoyée est dérivée de start.toISOString() (UTC),
      // donc on calcule l'attendu via la même logique.
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-12-22T12:00:00.000Z"));

      prisma.exerciceSession.findFirst.mockResolvedValue(null);

      const out = await service.getYesterdaySummary("user-1", { lang: "fr" });

      // Reproduit STRICTEMENT la logique du service pour éviter les soucis de timezone.
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const expectedDate = start.toISOString().split("T")[0];

      expect(out).toEqual({
        id: null,
        date: expectedDate,
        quality: null,
        exercices: [],
      });

      const whereArg = prisma.exerciceSession.findFirst.mock.calls[0][0].where;
      expect(whereArg.userId).toBe("user-1");
      expect(whereArg.dateSession.gte).toBeInstanceOf(Date);
      expect(whereArg.dateSession.lte).toBeInstanceOf(Date);
      expect(whereArg.dateSession.gte.getHours()).toBe(0);
      expect(whereArg.dateSession.lte.getHours()).toBe(23);
    });

    it("si une session existe hier => retourne la session normalisée", async () => {
      const { service, prisma } = makeService();

      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-12-22T12:00:00.000Z"));

      prisma.exerciceSession.findFirst.mockResolvedValue(
        makeRawSession({
          id: "sess-y",
          userId: "user-1",
          dateSession: new Date("2025-12-21T08:00:00.000Z"),
          quality: 5,
          exerciceSerie: [
            {
              exerciceContentId: "c1",
              repetitionCount: 42,
              exerciceContent: { translations: [{ lang: "en", name: "Push-ups" }] },
            },
          ],
        }),
      );

      const out = await service.getYesterdaySummary("user-1", { lang: "en" });

      expect(out).toEqual({
        id: "sess-y",
        date: "2025-12-21",
        quality: 5,
        exercices: [
          {
            exerciceContentId: "c1",
            exerciceContentName: "Push-ups",
            repetitionCount: 42,
          },
        ],
      });
    });
  });
});
