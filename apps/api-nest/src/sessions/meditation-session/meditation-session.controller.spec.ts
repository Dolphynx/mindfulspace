import { BadRequestException } from "@nestjs/common";
import { MeditationSessionController } from "./meditation-session.controller";
import type { CreateMeditationSessionDto } from "./dto/meditation-session.dto";

/**
 * Tests unitaires pour {@link MeditationSessionController}.
 *
 * @remarks
 * Ces tests se concentrent sur les responsabilités propres au contrôleur :
 * - garde-fous côté frontière HTTP (règles de validation des query params),
 * - orchestration entre services (MeditationSessionService + BadgesService),
 * - délégation vers la bonne méthode de service selon les paramètres de requête.
 *
 * Le runtime Nest n’est volontairement pas bootstrappé ici : on instancie le contrôleur
 * directement et on fournit des dépendances mockées.
 */
describe("MeditationSessionController", () => {
  /**
   * Forme minimale mockée de la dépendance MeditationSessionService.
   *
   * @remarks
   * Le contrôleur n’appelle qu’un sous-ensemble des méthodes du service. On mocke ces méthodes
   * afin de vérifier la délégation correcte et d’éviter toute dépendance à la DB ou au framework.
   */
  const meditationService = {
    create: jest.fn(),
    getSessionsBetweenDates: jest.fn(),
    getLastNDays: jest.fn(),
    getDailySummary: jest.fn(),
    findAll: jest.fn(),
    getMeditationTypes: jest.fn(),
    getMeditationContents: jest.fn(),
  };

  /**
   * Forme minimale mockée de la dépendance BadgesService.
   *
   * @remarks
   * Le contrôleur utilise ce service après la création d’une session de méditation, afin de vérifier
   * si de nouveaux badges ont été débloqués.
   */
  const badgesService = {
    checkForNewBadges: jest.fn(),
  };

  let controller: MeditationSessionController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new MeditationSessionController(
      meditationService as any,
      badgesService as any,
    );
  });

  describe("getSessionsForCurrentUser", () => {
    /**
     * Vérifie que le contrôleur applique la règle : `from` et `to` doivent être fournis ensemble.
     *
     * @remarks
     * C’est un garde-fou au niveau contrôleur : le service s’attend à des paramètres cohérents.
     * Si le client fournit une plage incomplète, le contrôleur doit rejeter tôt.
     */
    it("throws BadRequestException when `from` is provided without `to`", () => {
      expect(() =>
        controller.getSessionsForCurrentUser("u1", {
          from: "2025-12-01",
        } as any),
      ).toThrow(BadRequestException);

      expect(meditationService.getSessionsBetweenDates).not.toHaveBeenCalled();
      expect(meditationService.getLastNDays).not.toHaveBeenCalled();
    });

    /**
     * Vérifie que le contrôleur applique la règle : `from` et `to` doivent être fournis ensemble.
     */
    it("throws BadRequestException when `to` is provided without `from`", () => {
      expect(() =>
        controller.getSessionsForCurrentUser("u1", {
          to: "2025-12-10",
        } as any),
      ).toThrow(BadRequestException);

      expect(meditationService.getSessionsBetweenDates).not.toHaveBeenCalled();
      expect(meditationService.getLastNDays).not.toHaveBeenCalled();
    });

    /**
     * Vérifie que lorsqu’une plage de dates complète est fournie, le contrôleur délègue
     * à la bonne méthode de service.
     */
    it("delegates to getSessionsBetweenDates when `from` and `to` are provided", async () => {
      meditationService.getSessionsBetweenDates.mockResolvedValue([{ date: "2025-12-01" }]);

      const result = await controller.getSessionsForCurrentUser("u1", {
        from: "2025-12-01",
        to: "2025-12-10",
      } as any);

      expect(meditationService.getSessionsBetweenDates).toHaveBeenCalledWith("u1", {
        from: "2025-12-01",
        to: "2025-12-10",
      });
      expect(meditationService.getLastNDays).not.toHaveBeenCalled();
      expect(result).toEqual([{ date: "2025-12-01" }]);
    });

    /**
     * Vérifie que lorsque aucune plage de dates n’est fournie, le contrôleur délègue
     * vers “les N derniers jours” avec la valeur par défaut.
     */
    it("delegates to getLastNDays with default `lastDays = 7` when no range is provided", async () => {
      meditationService.getLastNDays.mockResolvedValue([{ date: "2025-12-20" }]);

      const result = await controller.getSessionsForCurrentUser("u1", {} as any);

      expect(meditationService.getLastNDays).toHaveBeenCalledWith("u1", 7);
      expect(meditationService.getSessionsBetweenDates).not.toHaveBeenCalled();
      expect(result).toEqual([{ date: "2025-12-20" }]);
    });

    /**
     * Vérifie que lorsque `lastDays` est fourni explicitement, le contrôleur le transmet tel quel.
     */
    it("delegates to getLastNDays with provided `lastDays`", async () => {
      meditationService.getLastNDays.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("u1", { lastDays: 3 } as any);

      expect(meditationService.getLastNDays).toHaveBeenCalledWith("u1", 3);
    });
  });

  describe("createForCurrentUser", () => {
    /**
     * Vérifie que la création de session est orchestrée correctement :
     * - créer la session,
     * - puis vérifier les nouveaux badges débloqués,
     * - retourner les deux informations.
     */
    it("returns { session, newBadges } and calls both services", async () => {
      meditationService.create.mockResolvedValue({ id: "s1" });
      badgesService.checkForNewBadges.mockResolvedValue([{ id: "b1" }]);

      const dto: CreateMeditationSessionDto = {
        dateSession: "2025-12-20",
        meditationTypeId: "t1",
        durationSeconds: 300,
      } as any;

      const result = await controller.createForCurrentUser("u1", dto);

      expect(meditationService.create).toHaveBeenCalledWith("u1", dto);
      expect(badgesService.checkForNewBadges).toHaveBeenCalledWith("u1");
      expect(result).toEqual({
        session: { id: "s1" },
        newBadges: [{ id: "b1" }],
      });
    });
  });

  describe("getMeditationContents", () => {
    /**
     * Vérifie que le contrôleur rejette les requêtes où le paramètre obligatoire `meditationTypeId` est manquant.
     *
     * @remarks
     * Le service protège aussi contre l’absence de `meditationTypeId`, mais le contrôleur
     * réalise un contrôle clair à la frontière HTTP avec un message d’erreur spécifique.
     */
    it("throws BadRequestException when meditationTypeId is missing", () => {
      expect(() => controller.getMeditationContents({} as any)).toThrow(BadRequestException);
      expect(meditationService.getMeditationContents).not.toHaveBeenCalled();
    });

    /**
     * Vérifie que le contrôleur délègue au service lorsque `meditationTypeId` est présent.
     */
    it("delegates to service with meditationTypeId and optional durationSeconds", async () => {
      meditationService.getMeditationContents.mockResolvedValue([{ id: "c1", mediaUrl: null }]);

      const result = await controller.getMeditationContents({
        meditationTypeId: "t1",
        durationSeconds: 300,
      } as any);

      expect(meditationService.getMeditationContents).toHaveBeenCalledWith("t1", 300);
      expect(result).toEqual([{ id: "c1", mediaUrl: null }]);
    });
  });
});
