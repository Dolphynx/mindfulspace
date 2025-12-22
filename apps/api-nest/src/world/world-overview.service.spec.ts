import { WorldOverviewService } from "./world-overview.service";

/**
 * Tests unitaires du {@link WorldOverviewService}.
 *
 * @remarks
 * Ces tests valident la logique d'agrégation du service sans accès réel à une base de données.
 * Prisma est mocké via des objets simples exposant uniquement les méthodes utilisées.
 *
 * Le service calcule un payload d'overview composé de :
 * - snapshot (minutes semaine, score de bien-être, streak de méditation),
 * - KPIs Sleep,
 * - KPIs Meditation,
 * - KPIs Exercise.
 *
 * La suite de tests se concentre sur :
 * - l'utilisation cohérente des requêtes Prisma (fenêtres temporelles),
 * - les agrégations (moyennes, totaux, distinct),
 * - la stabilité du payload lorsque les datasets sont vides.
 */
describe("WorldOverviewService", () => {
  /**
   * Construit une instance de service avec un mock Prisma minimal.
   *
   * @remarks
   * Seules les méthodes Prisma invoquées par `getOverviewForUser` sont définies.
   */
  function makeService() {
    const prisma = {
      sleepSession: {
        findMany: jest.fn(),
      },
      meditationSession: {
        findMany: jest.fn(),
      },
      exerciceSession: {
        findMany: jest.fn(),
      },
    };

    const service = new WorldOverviewService(prisma as any);
    return { service, prisma };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  /**
   * Fige l'heure système pour rendre déterministes les calculs de bornes temporelles.
   *
   * @remarks
   * Le service utilise `new Date()` en interne pour calculer :
   * - le début de semaine ISO (lundi 00:00),
   * - le début de journée,
   * - le début de la fenêtre des 7 derniers jours (inclusif J-6..J).
   *
   * Le fait de figer l'heure évite les dérives liées au fuseau et aux exécutions en CI.
   */
  function freezeTime(isoDateTime: string) {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(isoDateTime));
  }

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Vérifie que le service renvoie un payload stable lorsque l'utilisateur n'a aucune donnée.
   *
   * @remarks
   * Propriété importante pour un dashboard : la forme du payload doit rester stable
   * même si aucune session n'existe encore.
   */
  it("renvoie un payload stable avec des zéros et des nulls lorsqu'il n'y a aucune donnée", async () => {
    freezeTime("2025-12-22T10:00:00.000Z"); // Lundi

    const { service, prisma } = makeService();

    prisma.sleepSession.findMany.mockResolvedValue([]);
    prisma.meditationSession.findMany
      .mockResolvedValueOnce([]) // fenêtre 7 jours
      .mockResolvedValueOnce([]); // semaine
    prisma.exerciceSession.findMany.mockResolvedValue([]);

    const result = await service.getOverviewForUser("usr_1");

    expect(result).toEqual({
      snapshot: {
        weekMinutes: 0,
        wellbeingScore: 13,
        meditationStreakDays: 0,
      },
      sleep: {
        avgDurationMinutes: 0,
        avgQuality: null,
        lastNightMinutes: null,
        lastNightQuality: null,
      },
      meditation: {
        last7DaysSessions: 0,
        last7DaysMinutes: 0,
        avgMoodAfter: null,
      },
      exercise: {
        weekSessions: 0,
        weekDistinctExercises: 0,
        avgQuality: null,
      },
    });

    /**
     * Vérifie que les appels Prisma contiennent bien une borne `gte` cohérente.
     *
     * @remarks
     * Les dates exactes peuvent dépendre du fuseau (objet Date). On vérifie donc
     * uniquement la présence d'une borne `gte` de type Date sur les champs attendus.
     */
    expect(prisma.sleepSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "usr_1",
          dateSession: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );

    expect(prisma.meditationSession.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "usr_1",
          startedAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );

    expect(prisma.exerciceSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "usr_1",
          dateSession: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );
  });

  /**
   * Vérifie que les minutes de méditation "semaine" sont calculées à partir des sessions
   * depuis le début de semaine ISO.
   */
  it("calcule les minutes de méditation sur la semaine à partir des sessions depuis le début de semaine ISO", async () => {
    freezeTime("2025-12-24T10:00:00.000Z"); // Mercredi

    const { service, prisma } = makeService();

    prisma.sleepSession.findMany.mockResolvedValue([]);

    prisma.meditationSession.findMany
      .mockResolvedValueOnce([]) // 7 jours (non pertinent pour ce test)
      .mockResolvedValueOnce([
        { durationSeconds: 600 }, // 10 min
        { durationSeconds: 1800 }, // 30 min
      ]);

    prisma.exerciceSession.findMany.mockResolvedValue([]);

    const result = await service.getOverviewForUser("usr_1");

    expect(result.snapshot.weekMinutes).toBe(40);
  });

  /**
   * Vérifie les KPIs de méditation calculés sur les 7 derniers jours :
   * - nombre de séances,
   * - minutes totales,
   * - humeur moyenne (moodAfter),
   * - streak calculée sur les jours distincts ayant au moins une séance.
   */
  it("calcule les KPIs des 7 derniers jours et la streak à partir des jours distincts", async () => {
    freezeTime("2025-12-22T10:00:00.000Z"); // Lundi

    const { service, prisma } = makeService();

    prisma.sleepSession.findMany.mockResolvedValue([]);

    prisma.meditationSession.findMany
      .mockResolvedValueOnce([
        { startedAt: new Date("2025-12-22T08:00:00.000Z"), durationSeconds: 600, moodAfter: 4 },
        { startedAt: new Date("2025-12-21T08:00:00.000Z"), durationSeconds: 1200, moodAfter: 3 },
        { startedAt: new Date("2025-12-21T20:00:00.000Z"), durationSeconds: 600, moodAfter: 5 },
      ])
      .mockResolvedValueOnce([]); // semaine (non pertinent pour ce test)

    prisma.exerciceSession.findMany.mockResolvedValue([]);

    const result = await service.getOverviewForUser("usr_1");

    expect(result.meditation.last7DaysSessions).toBe(3);
    expect(result.meditation.last7DaysMinutes).toBe(Math.round((600 + 1200 + 600) / 60)); // 40
    expect(result.meditation.avgMoodAfter).toBe(4); // (4+3+5)/3 = 4
    expect(result.snapshot.meditationStreakDays).toBe(2); // 22 puis 21 => 2 jours consécutifs
  });

  /**
   * Vérifie les KPIs Sleep :
   * - moyenne de durée (heures -> minutes),
   * - moyenne de qualité (arrondie),
   * - dernière nuit basée sur la session la plus récente (ordre décroissant).
   */
  it("calcule les moyennes Sleep et les KPIs de la dernière nuit", async () => {
    freezeTime("2025-12-22T10:00:00.000Z");

    const { service, prisma } = makeService();

    prisma.sleepSession.findMany.mockResolvedValue([
      { hours: 7, quality: 4, dateSession: new Date("2025-12-22T00:00:00.000Z") },
      { hours: 8, quality: 3, dateSession: new Date("2025-12-21T00:00:00.000Z") },
    ]);

    prisma.meditationSession.findMany
      .mockResolvedValueOnce([]) // 7 jours
      .mockResolvedValueOnce([]); // semaine

    prisma.exerciceSession.findMany.mockResolvedValue([]);

    const result = await service.getOverviewForUser("usr_1");

    expect(result.sleep.avgDurationMinutes).toBe(Math.round(((7 * 60) + (8 * 60)) / 2)); // 450
    expect(result.sleep.avgQuality).toBe(Math.round((4 + 3) / 2)); // 4
    expect(result.sleep.lastNightMinutes).toBe(7 * 60);
    expect(result.sleep.lastNightQuality).toBe(4);
  });

  /**
   * Vérifie les KPIs Exercise :
   * - nombre de séances sur la semaine,
   * - nombre d'exercices distincts (via les séries),
   * - qualité moyenne (arrondie).
   */
  it("calcule les KPIs Exercise sur la semaine (séances, exercices distincts, qualité moyenne)", async () => {
    freezeTime("2025-12-22T10:00:00.000Z");

    const { service, prisma } = makeService();

    prisma.sleepSession.findMany.mockResolvedValue([]);

    prisma.meditationSession.findMany
      .mockResolvedValueOnce([]) // 7 jours
      .mockResolvedValueOnce([]); // semaine

    prisma.exerciceSession.findMany.mockResolvedValue([
      {
        quality: 4,
        dateSession: new Date("2025-12-22T00:00:00.000Z"),
        exerciceSerie: [{ exerciceContentId: "ex_1" }, { exerciceContentId: "ex_2" }],
      },
      {
        quality: 2,
        dateSession: new Date("2025-12-21T00:00:00.000Z"),
        exerciceSerie: [{ exerciceContentId: "ex_2" }, { exerciceContentId: "ex_3" }],
      },
    ]);

    const result = await service.getOverviewForUser("usr_1");

    expect(result.exercise.weekSessions).toBe(2);
    expect(result.exercise.weekDistinctExercises).toBe(3); // ex_1, ex_2, ex_3
    expect(result.exercise.avgQuality).toBe(Math.round((4 + 2) / 2)); // 3
  });
});
