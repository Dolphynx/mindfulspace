import { BadgesController } from "./badges.controller";

/**
 * Tests unitaires pour {@link BadgesController}.
 *
 * @remarks
 * Ces tests valident les responsabilités du contrôleur :
 * - transmission correcte des paramètres (userId, query.limit),
 * - délégation correcte vers {@link BadgesService}.
 *
 * Le runtime Nest n’est pas bootstrappé. Le contrôleur est instancié
 * directement avec des dépendances mockées.
 */
describe("BadgesController", () => {
  /**
   * Forme minimale mockée de la dépendance BadgesService.
   *
   * @remarks
   * Seules les méthodes utilisées par le contrôleur sont mockées.
   */
  const badgesService = {
    getUserBadges: jest.fn(),
    getHighlightedBadges: jest.fn(),
  };

  let controller: BadgesController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new BadgesController(badgesService as any);
  });

  describe("getMyBadges", () => {
    /**
     * Vérifie que le contrôleur transmet userId et query.limit au service.
     *
     * @remarks
     * Le contrôleur n’impose pas de limite par défaut ; il délègue la gestion
     * des limites à la couche service (valeurs par défaut / bornage).
     */
    it("delegates to getUserBadges with userId and limit", async () => {
      const userId = "usr_1";
      badgesService.getUserBadges.mockResolvedValue([{ id: "ub_1" }]);

      const result = await controller.getMyBadges(userId, { limit: 7 } as any);

      expect(badgesService.getUserBadges).toHaveBeenCalledWith(userId, 7);
      expect(result).toEqual([{ id: "ub_1" }]);
    });

    /**
     * Vérifie que le contrôleur transmet une limite `undefined` lorsqu’elle est absente.
     */
    it("delegates to getUserBadges with undefined limit when absent", async () => {
      const userId = "usr_1";
      badgesService.getUserBadges.mockResolvedValue([]);

      await controller.getMyBadges(userId, {} as any);

      expect(badgesService.getUserBadges).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe("getMyHighlightedBadges", () => {
    /**
     * Vérifie que le contrôleur transmet userId et query.limit au service.
     *
     * @remarks
     * Le service encapsule le comportement de compatibilité :
     * - valeur par défaut à 3 lorsque limit est undefined,
     * - bornage dans les limites autorisées.
     */
    it("delegates to getHighlightedBadges with userId and limit", async () => {
      const userId = "usr_1";
      badgesService.getHighlightedBadges.mockResolvedValue([{ id: "ub_1" }]);

      const result = await controller.getMyHighlightedBadges(userId, { limit: 5 } as any);

      expect(badgesService.getHighlightedBadges).toHaveBeenCalledWith(userId, 5);
      expect(result).toEqual([{ id: "ub_1" }]);
    });

    /**
     * Vérifie que le contrôleur transmet une limite `undefined` lorsqu’elle est absente.
     */
    it("delegates to getHighlightedBadges with undefined limit when absent", async () => {
      const userId = "usr_1";
      badgesService.getHighlightedBadges.mockResolvedValue([]);

      await controller.getMyHighlightedBadges(userId, {} as any);

      expect(badgesService.getHighlightedBadges).toHaveBeenCalledWith(userId, undefined);
    });
  });
});
