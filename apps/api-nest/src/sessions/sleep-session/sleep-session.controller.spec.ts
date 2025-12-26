import { SleepSessionController } from "./sleep-session.controller";

/**
 * Tests unitaires du {@link SleepSessionController}.
 *
 * @remarks
 * Ces tests vérifient les responsabilités du contrôleur :
 * - délégation correcte au {@link SleepSessionService},
 * - appel au {@link ../badges/BadgesService} après création,
 * - logique de routage / sélection des méthodes (lastDays / from-to / fallback).
 *
 * Le runtime NestJS n'est pas démarré : on instancie le contrôleur directement
 * avec des dépendances mockées.
 */
describe("SleepSessionController", () => {
  /**
   * Mock minimal du service métier sleep.
   *
   * @remarks
   * On ne mocke que les méthodes appelées par le contrôleur.
   */
  const sleepService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getLast7Days: jest.fn(),
    getLastNDays: jest.fn(),
    getSessionsBetweenDates: jest.fn(),
    getAllForUser: jest.fn(),
    getYesterdaySummary: jest.fn(),
    getDailySummary: jest.fn(),
  };

  /**
   * Mock minimal du service de badges.
   *
   * @remarks
   * Le contrôleur déclenche un recalcul de badges après création.
   */
  const badgesService = {
    checkForNewBadges: jest.fn(),
  };

  let controller: SleepSessionController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new SleepSessionController(sleepService as any, badgesService as any);
  });

  describe("create", () => {
    /**
     * Vérifie que la création :
     * - délègue à `sleepService.create(userId, dto)`,
     * - puis appelle `badgesService.checkForNewBadges(userId)`,
     * - et renvoie `{ session, newBadges }`.
     */
    it("crée une session et retourne la session + les nouveaux badges", async () => {
      const userId = "usr_1";
      const dto = { hours: 7, quality: 4, dateSession: "2025-12-20" };

      const session = { id: "slp_1" };
      const newBadges = [{ id: "ub_1" }];

      sleepService.create.mockResolvedValue(session);
      badgesService.checkForNewBadges.mockResolvedValue(newBadges);

      const result = await controller.create(userId, dto as any);

      expect(sleepService.create).toHaveBeenCalledWith(userId, dto);
      expect(badgesService.checkForNewBadges).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ session, newBadges });
    });
  });

  describe("findAll", () => {
    /**
     * Vérifie que l'endpoint historique `GET /sleep` délègue au service.
     *
     * @remarks
     * Cet endpoint n'est pas user-scopé et est conservé pour compatibilité.
     */
    it("délègue à sleepService.findAll", async () => {
      sleepService.findAll.mockResolvedValue([{ id: "slp_1" }]);

      const result = await controller.findAll();

      expect(sleepService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ id: "slp_1" }]);
    });
  });

  describe("getLast7Days", () => {
    /**
     * Vérifie que l'endpoint `GET /sleep/last7days` délègue au service.
     */
    it("délègue à sleepService.getLast7Days", async () => {
      sleepService.getLast7Days.mockResolvedValue([{ date: "2025-12-20", hours: 7, quality: 4 }]);

      const result = await controller.getLast7Days("usr_1");

      expect(sleepService.getLast7Days).toHaveBeenCalledWith("usr_1");
      expect(result).toEqual([{ date: "2025-12-20", hours: 7, quality: 4 }]);
    });
  });

  describe("getSessionsForCurrentUser", () => {
    /**
     * Vérifie la branche `lastDays` :
     * - conversion de string -> number,
     * - fallback à 7 si valeur invalide ou <= 0,
     * - délégation à `getLastNDays`.
     */
    it("utilise lastDays lorsque fourni et délègue à getLastNDays", async () => {
      sleepService.getLastNDays.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("usr_1", "30", undefined, undefined);

      expect(sleepService.getLastNDays).toHaveBeenCalledWith("usr_1", 30);
      expect(sleepService.getSessionsBetweenDates).not.toHaveBeenCalled();
      expect(sleepService.getAllForUser).not.toHaveBeenCalled();
    });

    /**
     * Vérifie le fallback lastDays lorsque la valeur est invalide.
     */
    it("fallback lastDays à 7 si lastDays est invalide", async () => {
      sleepService.getLastNDays.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("usr_1", "not-a-number", undefined, undefined);

      expect(sleepService.getLastNDays).toHaveBeenCalledWith("usr_1", 7);
    });

    /**
     * Vérifie la branche `from/to` :
     * si `from` ou `to` est fourni, délègue à `getSessionsBetweenDates`.
     */
    it("utilise from/to lorsque fourni et délègue à getSessionsBetweenDates", async () => {
      sleepService.getSessionsBetweenDates.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("usr_1", undefined, "2025-12-01", "2025-12-20");

      expect(sleepService.getSessionsBetweenDates).toHaveBeenCalledWith("usr_1", {
        from: "2025-12-01",
        to: "2025-12-20",
      });
      expect(sleepService.getLastNDays).not.toHaveBeenCalled();
      expect(sleepService.getAllForUser).not.toHaveBeenCalled();
    });

    /**
     * Vérifie le fallback :
     * si ni lastDays ni from/to, délègue à `getAllForUser`.
     */
    it("fallback sur getAllForUser lorsque aucun filtre n'est fourni", async () => {
      sleepService.getAllForUser.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("usr_1", undefined, undefined, undefined);

      expect(sleepService.getAllForUser).toHaveBeenCalledWith("usr_1");
      expect(sleepService.getLastNDays).not.toHaveBeenCalled();
      expect(sleepService.getSessionsBetweenDates).not.toHaveBeenCalled();
    });
  });

  describe("getYesterdaySummary", () => {
    /**
     * Vérifie que l'endpoint historique `GET /sleep/summary/yesterday`
     * délègue au service.
     */
    it("délègue à sleepService.getYesterdaySummary", async () => {
      sleepService.getYesterdaySummary.mockResolvedValue({ hours: 7, quality: 4 });

      const result = await controller.getYesterdaySummary();

      expect(sleepService.getYesterdaySummary).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ hours: 7, quality: 4 });
    });
  });

  describe("getDailySummary", () => {
    /**
     * Vérifie que `GET /sleep/me/summary/daily` délègue au service
     * en passant le userId et la date optionnelle.
     */
    it("délègue à sleepService.getDailySummary avec userId et date", async () => {
      sleepService.getDailySummary.mockResolvedValue({ date: "2025-12-20", hours: 7, quality: 4 });

      const result = await controller.getDailySummary("usr_1", "2025-12-20");

      expect(sleepService.getDailySummary).toHaveBeenCalledWith("usr_1", "2025-12-20");
      expect(result).toEqual({ date: "2025-12-20", hours: 7, quality: 4 });
    });
  });
});
