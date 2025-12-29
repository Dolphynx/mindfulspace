import { ExerciseSessionController } from "./exercise-session.controller";

/**
 * Tests unitaires du {@link ExerciseSessionController}.
 *
 * @remarks
 * Ces tests vérifient les responsabilités du contrôleur :
 * - délégation correcte au {@link ExerciceSessionService},
 * - appel au service de badges après création,
 * - logique de routage / sélection de la méthode selon les query params :
 *   - lastDays => getLastNDays (avec clamp/safeN)
 *   - from/to => getSessionsBetweenDates
 *   - sinon => findAll
 *
 * Le runtime NestJS n'est pas démarré : on instancie le contrôleur directement
 * avec des dépendances mockées.
 */
describe("ExerciseSessionController", () => {
  /**
   * Mock minimal du service métier.
   *
   * @remarks
   * On ne teste pas Prisma ici : uniquement que le contrôleur appelle la bonne
   * méthode avec les bons paramètres.
   */
  const exerciceSessionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getLast7Days: jest.fn(),
    getLastNDays: jest.fn(),
    getSessionsBetweenDates: jest.fn(),
    getYesterdaySummary: jest.fn(),
    getExerciceContents: jest.fn(),
  };

  /**
   * Mock minimal du service de badges.
   *
   * @remarks
   * Le contrôleur déclenche un recalcul de badges après la création d'une session.
   */
  const badgesService = {
    checkForNewBadges: jest.fn(),
  };

  let controller: ExerciseSessionController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ExerciseSessionController(
      exerciceSessionService as any,
      badgesService as any,
    );
  });

  describe("create", () => {
    it("délègue à service.create puis déclenche checkForNewBadges et renvoie { session, newBadges }", async () => {
      const userId = "user-1";
      const dto = {
        dateSession: "2025-12-01",
        quality: 4,
        exercices: [{ exerciceContentId: "c1", repetitionCount: 10 }],
      };

      const session = { id: "s1" };
      const newBadges = [{ id: "b1" }];

      exerciceSessionService.create.mockResolvedValue(session);
      badgesService.checkForNewBadges.mockResolvedValue(newBadges);

      await expect(controller.create(userId, dto as any)).resolves.toEqual({
        session,
        newBadges,
      });

      expect(exerciceSessionService.create).toHaveBeenCalledTimes(1);
      expect(exerciceSessionService.create).toHaveBeenCalledWith(userId, dto);

      expect(badgesService.checkForNewBadges).toHaveBeenCalledTimes(1);
      expect(badgesService.checkForNewBadges).toHaveBeenCalledWith(userId);
    });
  });

  describe("findAll", () => {
    it("si lastDays est fourni => appelle getLastNDays avec safeN (valide)", async () => {
      const userId = "user-1";
      const lang = "fr";

      exerciceSessionService.getLastNDays.mockResolvedValue([{ id: "s1" }]);

      await controller.findAll(userId, lang, "14");
      expect(exerciceSessionService.getLastNDays).toHaveBeenCalledTimes(1);
      expect(exerciceSessionService.getLastNDays).toHaveBeenCalledWith(
        userId,
        14,
        { lang },
      );
      expect(exerciceSessionService.findAll).not.toHaveBeenCalled();
      expect(exerciceSessionService.getSessionsBetweenDates).not.toHaveBeenCalled();
    });

    it("si lastDays est invalide (NaN / <=0) => fallback safeN = 7", async () => {
      const userId = "user-1";
      const lang = "en";

      exerciceSessionService.getLastNDays.mockResolvedValue([{ id: "s1" }]);

      await controller.findAll(userId, lang, "0");
      expect(exerciceSessionService.getLastNDays).toHaveBeenCalledWith(userId, 7, {
        lang,
      });

      jest.clearAllMocks();

      await controller.findAll(userId, lang, "abc");
      expect(exerciceSessionService.getLastNDays).toHaveBeenCalledWith(userId, 7, {
        lang,
      });
    });

    it("si from/to est fourni => appelle getSessionsBetweenDates", async () => {
      const userId = "user-1";
      const lang = "fr";
      const from = "2025-12-01";
      const to = "2025-12-20";

      exerciceSessionService.getSessionsBetweenDates.mockResolvedValue([{ id: "s1" }]);

      await controller.findAll(userId, lang, undefined, from, to);

      expect(exerciceSessionService.getSessionsBetweenDates).toHaveBeenCalledTimes(1);
      expect(exerciceSessionService.getSessionsBetweenDates).toHaveBeenCalledWith(
        userId,
        { from, to },
        { lang },
      );

      expect(exerciceSessionService.findAll).not.toHaveBeenCalled();
      expect(exerciceSessionService.getLastNDays).not.toHaveBeenCalled();
    });

    it("sinon => appelle findAll", async () => {
      const userId = "user-1";
      const lang = "en";

      exerciceSessionService.findAll.mockResolvedValue([{ id: "s1" }]);

      await controller.findAll(userId, lang);

      expect(exerciceSessionService.findAll).toHaveBeenCalledTimes(1);
      expect(exerciceSessionService.findAll).toHaveBeenCalledWith(userId, { lang });

      expect(exerciceSessionService.getLastNDays).not.toHaveBeenCalled();
      expect(exerciceSessionService.getSessionsBetweenDates).not.toHaveBeenCalled();
    });
  });

  describe("getLast7Days", () => {
    it("délègue à service.getLast7Days", async () => {
      const userId = "user-1";
      const lang = "fr";

      exerciceSessionService.getLast7Days.mockResolvedValue([{ id: "s1" }]);

      await controller.getLast7Days(userId, lang);
      expect(exerciceSessionService.getLast7Days).toHaveBeenCalledWith(userId, {
        lang,
      });
    });
  });

  describe("getYesterdaySummary", () => {
    it("délègue à service.getYesterdaySummary", async () => {
      const userId = "user-1";
      const lang = "en";

      exerciceSessionService.getYesterdaySummary.mockResolvedValue({
        id: null,
        date: "2025-12-01",
        quality: null,
        exercices: [],
      });

      await controller.getYesterdaySummary(userId, lang);
      expect(exerciceSessionService.getYesterdaySummary).toHaveBeenCalledWith(userId, {
        lang,
      });
    });
  });

  describe("getExerciceContents", () => {
    it("délègue à service.getExerciceContents (public)", async () => {
      const lang = "fr";
      exerciceSessionService.getExerciceContents.mockResolvedValue([
        { id: "c1", name: "Pompes" },
      ]);

      await controller.getExerciceContents(lang);
      expect(exerciceSessionService.getExerciceContents).toHaveBeenCalledWith({ lang });
    });
  });

  describe("findOne", () => {
    it("délègue à service.findOne", async () => {
      const userId = "user-1";
      const id = "sess-1";
      const lang = "en";

      exerciceSessionService.findOne.mockResolvedValue({ id, date: "2025-12-01" });

      await controller.findOne(id, userId, lang);
      expect(exerciceSessionService.findOne).toHaveBeenCalledWith(id, userId, { lang });
    });
  });
});
