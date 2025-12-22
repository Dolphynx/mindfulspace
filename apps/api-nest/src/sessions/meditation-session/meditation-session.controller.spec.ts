import { BadRequestException } from "@nestjs/common";
import { MeditationSessionController } from "./meditation-session.controller";
import type { CreateMeditationSessionDto } from "./dto/meditation-session.dto";

/**
 * Unit tests for {@link MeditationSessionController}.
 *
 * @remarks
 * These tests focus on controller-specific responsibilities:
 * - input guardrails at the HTTP boundary (query validation rules),
 * - orchestration between services (MeditationSessionService + BadgesService),
 * - delegation to the appropriate service method based on query parameters.
 *
 * The Nest runtime is intentionally not bootstrapped here: we instantiate the controller
 * directly and provide mocked dependencies.
 */
describe("MeditationSessionController", () => {
  /**
   * Minimal mocked shape of the MeditationSessionService dependency.
   *
   * @remarks
   * The controller only calls a subset of service methods. We mock those methods
   * to assert correct delegation and to avoid any database or framework dependency.
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
   * Minimal mocked shape of the BadgesService dependency.
   *
   * @remarks
   * The controller uses this service after creating a meditation session, to check
   * whether new badges have been unlocked.
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
     * Ensures the controller enforces the rule: `from` and `to` must be provided together.
     *
     * @remarks
     * This is a controller-level guardrail: the service expects coherent parameters.
     * If the client provides an incomplete range, the controller must reject early.
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
     * Ensures the controller enforces the rule: `from` and `to` must be provided together.
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
     * Ensures that when a complete date range is provided, the controller delegates
     * to the correct service method.
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
     * Ensures that when no date range is provided, the controller delegates to
     * "last N days" with the default fallback value.
     */
    it("delegates to getLastNDays with default `lastDays = 7` when no range is provided", async () => {
      meditationService.getLastNDays.mockResolvedValue([{ date: "2025-12-20" }]);

      const result = await controller.getSessionsForCurrentUser("u1", {} as any);

      expect(meditationService.getLastNDays).toHaveBeenCalledWith("u1", 7);
      expect(meditationService.getSessionsBetweenDates).not.toHaveBeenCalled();
      expect(result).toEqual([{ date: "2025-12-20" }]);
    });

    /**
     * Ensures that when `lastDays` is explicitly provided, the controller passes it through.
     */
    it("delegates to getLastNDays with provided `lastDays`", async () => {
      meditationService.getLastNDays.mockResolvedValue([]);

      await controller.getSessionsForCurrentUser("u1", { lastDays: 3 } as any);

      expect(meditationService.getLastNDays).toHaveBeenCalledWith("u1", 3);
    });
  });

  describe("createForCurrentUser", () => {
    /**
     * Ensures session creation is orchestrated correctly:
     * - create the session,
     * - then check for newly unlocked badges,
     * - return both pieces of information.
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
     * Ensures the controller rejects requests missing the mandatory meditationTypeId parameter.
     *
     * @remarks
     * The service also protects against missing meditationTypeId, but the controller
     * performs a clear HTTP boundary check with a specific error message.
     */
    it("throws BadRequestException when meditationTypeId is missing", () => {
      expect(() => controller.getMeditationContents({} as any)).toThrow(BadRequestException);
      expect(meditationService.getMeditationContents).not.toHaveBeenCalled();
    });

    /**
     * Ensures the controller delegates to the service when meditationTypeId is present.
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
