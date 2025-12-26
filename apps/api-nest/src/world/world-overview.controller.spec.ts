import { WorldOverviewController } from "./world-overview.controller";

/**
 * Tests unitaires du {@link WorldOverviewController}.
 *
 * @remarks
 * Ces tests valident uniquement les responsabilités du contrôleur :
 * - délégation correcte vers le {@link WorldOverviewService},
 * - transmission correcte de l'identifiant de l'utilisateur courant,
 * - absence de transformation supplémentaire sur le payload renvoyé par le service.
 *
 * Le runtime NestJS n'est pas démarré : le contrôleur est instancié
 * directement avec des dépendances mockées.
 */
describe("WorldOverviewController", () => {
  /**
   * Mock minimal de dépendance {@link WorldOverviewService}.
   *
   * @remarks
   * Seule la méthode réellement utilisée par le contrôleur est mockée.
   */
  const service = {
    getOverviewForUser: jest.fn(),
  };

  let controller: WorldOverviewController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new WorldOverviewController(service as any);
  });

  /**
   * Vérifie que le contrôleur délègue au service avec l'identifiant utilisateur
   * et renvoie le résultat sans le modifier.
   */
  it("délègue à getOverviewForUser avec l'id utilisateur courant", async () => {
    const userId = "usr_1";

    const payload = {
      snapshot: { weekMinutes: 80, wellbeingScore: 72, meditationStreakDays: 5 },
      sleep: {
        avgDurationMinutes: 450,
        avgQuality: 4,
        lastNightMinutes: 420,
        lastNightQuality: 4,
      },
      meditation: { last7DaysSessions: 6, last7DaysMinutes: 80, avgMoodAfter: 4 },
      exercise: { weekSessions: 2, weekDistinctExercises: 3, avgQuality: 4 },
    };

    service.getOverviewForUser.mockResolvedValue(payload);

    const result = await controller.getMyWorldOverview(userId);

    expect(service.getOverviewForUser).toHaveBeenCalledWith(userId);
    expect(result).toBe(payload);
  });
});
