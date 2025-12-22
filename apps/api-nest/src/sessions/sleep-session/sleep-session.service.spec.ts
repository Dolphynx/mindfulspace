import { SleepSessionService } from "./sleep-session.service";

/**
 * Tests unitaires du {@link SleepSessionService}.
 *
 * @remarks
 * Ces tests valident la logique du service sans accès réel à la base de données :
 * - création avec "upsert logique" sur une journée (update si une session existe déjà ce jour-là),
 * - récupération des N derniers jours (fenêtre temporelle),
 * - récupération entre deux dates,
 * - résumé quotidien (date donnée ou veille).
 *
 * Prisma est mocké via des objets simples exposant les méthodes utilisées :
 * `findFirst`, `findMany`, `create`, `update`.
 *
 * Notes importantes sur les dates :
 * - `Date` en JavaScript dépend du fuseau local pour certaines opérations (setDate, setHours, etc.).
 * - `toISOString()` convertit systématiquement en UTC.
 * - Sur Windows/Node, `new Date("YYYY-MM-DD")` peut être interprété comme UTC (00:00Z).
 *
 * Pour garder des tests stables, on privilégie :
 * - des assertions sur les bornes Date transmises à Prisma,
 * - des vérifications de format (`YYYY-MM-DD`) plutôt que des dates "en dur"
 *   lorsque le service calcule des dates à partir de `new Date()`.
 */
describe("SleepSessionService", () => {
  /**
   * Crée une instance du service avec un mock Prisma minimal.
   */
  function makeService() {
    const prisma = {
      sleepSession: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const service = new SleepSessionService(prisma as any);
    return { service, prisma };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  /**
   * Fige l'horloge système pour rendre les calculs de dates déterministes.
   */
  function freezeTime(isoDateTime: string) {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(isoDateTime));
  }

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Convertit une date en clé jour ISO `YYYY-MM-DD` basée sur UTC (via toISOString).
   *
   * @remarks
   * On utilise ici la même méthode que le service (`toISOString().split("T")[0]`)
   * afin d'éviter les divergences de fuseau dans les assertions.
   */
  function toDayKeyUTC(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  describe("create", () => {
    it("met à jour la session existante si une session existe déjà sur la journée", async () => {
      const { service, prisma } = makeService();

      prisma.sleepSession.findFirst.mockResolvedValue({ id: "slp_existing" });
      prisma.sleepSession.update.mockResolvedValue({ id: "slp_existing", hours: 8 });

      const dto = { hours: 8, quality: 4, dateSession: "2025-12-20" };

      const result = await service.create("usr_1", dto as any);

      expect(prisma.sleepSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "usr_1",
            dateSession: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );

      expect(prisma.sleepSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "slp_existing" },
          data: expect.objectContaining({
            userId: "usr_1",
            hours: 8,
            quality: 4,
            dateSession: expect.any(Date),
          }),
        }),
      );

      expect(prisma.sleepSession.create).not.toHaveBeenCalled();
      expect(result).toEqual({ id: "slp_existing", hours: 8 });
    });

    it("crée une nouvelle session si aucune session n'existe sur la journée", async () => {
      const { service, prisma } = makeService();

      prisma.sleepSession.findFirst.mockResolvedValue(null);
      prisma.sleepSession.create.mockResolvedValue({ id: "slp_new" });

      const dto = { hours: 7, dateSession: "2025-12-20" };

      const result = await service.create("usr_1", dto as any);

      expect(prisma.sleepSession.update).not.toHaveBeenCalled();

      expect(prisma.sleepSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "usr_1",
            hours: 7,
            quality: null,
            dateSession: expect.any(Date),
          }),
        }),
      );

      expect(result).toEqual({ id: "slp_new" });
    });
  });

  describe("getLastNDays", () => {
    it("retourne les sessions des N derniers jours avec un filtre gte et un mapping date/hours/quality", async () => {
      freezeTime("2025-12-22T10:00:00.000Z");

      const { service, prisma } = makeService();

      prisma.sleepSession.findMany.mockResolvedValue([
        { dateSession: new Date("2025-12-21T00:00:00.000Z"), hours: 7, quality: 4 },
        { dateSession: new Date("2025-12-22T00:00:00.000Z"), hours: 8, quality: null },
      ]);

      const result = await service.getLastNDays("usr_1", 7);

      expect(prisma.sleepSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "usr_1",
            dateSession: expect.objectContaining({ gte: expect.any(Date) }),
          }),
          orderBy: { dateSession: "asc" },
        }),
      );

      expect(result).toEqual([
        { date: "2025-12-21", hours: 7, quality: 4 },
        { date: "2025-12-22", hours: 8, quality: null },
      ]);
    });
  });

  describe("getSessionsBetweenDates", () => {
    it("fallback sur getAllForUser si aucune borne n'est fournie", async () => {
      const { service } = makeService();

      const spy = jest
        .spyOn(service as any, "getAllForUser")
        .mockResolvedValue([{ date: "2025-12-20", hours: 7, quality: 4 }]);

      const result = await service.getSessionsBetweenDates("usr_1", {});

      expect(spy).toHaveBeenCalledWith("usr_1");
      expect(result).toEqual([{ date: "2025-12-20", hours: 7, quality: 4 }]);
    });

    it("applique un filtre between dates lorsque from/to sont fournis", async () => {
      const { service, prisma } = makeService();

      prisma.sleepSession.findMany.mockResolvedValue([
        { dateSession: new Date("2025-12-10T12:00:00.000Z"), hours: 7, quality: 4 },
      ]);

      const result = await service.getSessionsBetweenDates("usr_1", {
        from: "2025-12-01",
        to: "2025-12-31",
      });

      expect(prisma.sleepSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "usr_1",
            dateSession: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
          orderBy: { dateSession: "asc" },
        }),
      );

      expect(result).toEqual([{ date: "2025-12-10", hours: 7, quality: 4 }]);
    });
  });

  describe("getDailySummary", () => {
    it("retourne le résumé pour une date donnée", async () => {
      const { service, prisma } = makeService();

      prisma.sleepSession.findFirst.mockResolvedValue({
        hours: 8,
        quality: 4,
        dateSession: new Date("2025-12-20T12:00:00.000Z"),
      });

      const result = await service.getDailySummary("usr_1", "2025-12-20");

      expect(prisma.sleepSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "usr_1",
            dateSession: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
          orderBy: { dateSession: "desc" },
        }),
      );

      expect(result.hours).toBe(8);
      expect(result.quality).toBe(4);
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    /**
     * Vérifie le comportement par défaut : si aucune date n'est fournie,
     * le service calcule le résumé pour la veille (par rapport à `now`).
     *
     * @remarks
     * Plutôt que d'asserter une date "en dur" (sensible au fuseau),
     * on vérifie que la date retournée correspond à la borne `gte`
     * envoyée à Prisma, car cette borne est construite à partir de la
     * même logique interne du service.
     */
    it("par défaut, calcule le résumé pour la veille si aucune date n'est fournie", async () => {
      freezeTime("2025-12-22T10:00:00.000Z");

      const { service, prisma } = makeService();

      prisma.sleepSession.findFirst.mockResolvedValue(null);

      const result = await service.getDailySummary("usr_1", undefined);

      expect(result.hours).toBeNull();
      expect(result.quality).toBeNull();
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      /**
       * Récupère la borne `gte` réellement envoyée à Prisma et vérifie
       * que `result.date` correspond à cette même journée (même stratégie UTC).
       */
      const callArg = prisma.sleepSession.findFirst.mock.calls[0]?.[0];
      const gte = callArg?.where?.dateSession?.gte as Date | undefined;

      expect(gte).toBeInstanceOf(Date);
      expect(result.date).toBe(toDayKeyUTC(gte!));

      expect(prisma.sleepSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "usr_1",
            dateSession: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
          orderBy: { dateSession: "desc" },
        }),
      );
    });
  });
});
