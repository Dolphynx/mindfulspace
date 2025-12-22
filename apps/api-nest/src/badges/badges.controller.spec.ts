import { BadgesController } from "./badges.controller";

/**
 * Unit tests for {@link BadgesController}.
 *
 * @remarks
 * These tests validate controller responsibilities:
 * - parameter forwarding (userId, query.limit),
 * - correct delegation to {@link BadgesService}.
 *
 * The Nest runtime is not bootstrapped. The controller is instantiated
 * directly with mocked dependencies.
 */
describe("BadgesController", () => {
  /**
   * Minimal mocked shape of the BadgesService dependency.
   *
   * @remarks
   * Only the methods used by the controller are mocked.
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
     * Ensures the controller forwards userId and query.limit to the service.
     *
     * @remarks
     * The controller does not enforce default limits; it delegates limit handling
     * to the service layer (clamping / default values).
     */
    it("delegates to getUserBadges with userId and limit", async () => {
      const userId = "usr_1";
      badgesService.getUserBadges.mockResolvedValue([{ id: "ub_1" }]);

      const result = await controller.getMyBadges(userId, { limit: 7 } as any);

      expect(badgesService.getUserBadges).toHaveBeenCalledWith(userId, 7);
      expect(result).toEqual([{ id: "ub_1" }]);
    });

    /**
     * Ensures the controller forwards undefined limit when absent.
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
     * Ensures the controller forwards userId and query.limit to the service.
     *
     * @remarks
     * The service encapsulates compatibility behavior:
     * - default to 3 when limit is undefined,
     * - clamp within allowed bounds.
     */
    it("delegates to getHighlightedBadges with userId and limit", async () => {
      const userId = "usr_1";
      badgesService.getHighlightedBadges.mockResolvedValue([{ id: "ub_1" }]);

      const result = await controller.getMyHighlightedBadges(userId, { limit: 5 } as any);

      expect(badgesService.getHighlightedBadges).toHaveBeenCalledWith(userId, 5);
      expect(result).toEqual([{ id: "ub_1" }]);
    });

    /**
     * Ensures the controller forwards undefined limit when absent.
     */
    it("delegates to getHighlightedBadges with undefined limit when absent", async () => {
      const userId = "usr_1";
      badgesService.getHighlightedBadges.mockResolvedValue([]);

      await controller.getMyHighlightedBadges(userId, {} as any);

      expect(badgesService.getHighlightedBadges).toHaveBeenCalledWith(userId, undefined);
    });
  });
});
