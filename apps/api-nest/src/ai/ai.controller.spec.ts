import { AiController } from "./ai.controller";

/**
 * Tests unitaires du {@link AiController}.
 *
 * @remarks
 * Ces tests valident les responsabilités du contrôleur :
 * - Endpoints publics : pas d’auth à gérer ici (décorateur @Public testé en e2e si besoin).
 * - Délégation correcte à {@link AiService}.
 * - Format de réponse JSON :
 *   - /ai/mantra => { mantra }
 *   - /ai/encouragement => { encouragement }
 *   - /ai/objectives => renvoie directement l’objet { easy, normal, ambitious }
 *
 * Le runtime NestJS n'est pas démarré : on instancie le contrôleur directement
 * avec un service mocké.
 */
describe("AiController", () => {
  /**
   * Mock minimal du service IA.
   *
   * @remarks
   * On mocke uniquement les méthodes appelées par le contrôleur.
   */
  const aiService = {
    generateMantra: jest.fn(),
    generateEncouragement: jest.fn(),
    generateObjectives: jest.fn(),
  };

  let controller: AiController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new AiController(aiService as any);
  });

  describe("generateMantra", () => {
    it("délègue à aiService.generateMantra(theme, locale) et renvoie { mantra }", async () => {
      aiService.generateMantra.mockResolvedValue("Respire doucement.");

      const body = { theme: "stress", locale: "fr-BE" };

      const result = await controller.generateMantra(body as any);

      expect(aiService.generateMantra).toHaveBeenCalledTimes(1);
      expect(aiService.generateMantra).toHaveBeenCalledWith("stress", "fr-BE");
      expect(result).toEqual({ mantra: "Respire doucement." });
    });

    it("fonctionne avec un body vide (theme/locale undefined)", async () => {
      aiService.generateMantra.mockResolvedValue("Calme et présence.");

      const result = await controller.generateMantra({} as any);

      expect(aiService.generateMantra).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual({ mantra: "Calme et présence." });
    });
  });

  describe("generateEncouragement", () => {
    it("délègue à aiService.generateEncouragement(theme, locale) et renvoie { encouragement }", async () => {
      aiService.generateEncouragement.mockResolvedValue("Tu avances, pas à pas.");

      const body = { theme: "motivation", locale: "fr" };

      const result = await controller.generateEncouragement(body as any);

      expect(aiService.generateEncouragement).toHaveBeenCalledTimes(1);
      expect(aiService.generateEncouragement).toHaveBeenCalledWith("motivation", "fr");
      expect(result).toEqual({ encouragement: "Tu avances, pas à pas." });
    });
  });

  describe("generateObjectives", () => {
    it("délègue à aiService.generateObjectives(theme ?? '', locale) et renvoie l’objet tel quel", async () => {
      const objectives = {
        easy: "5 minutes de respiration.",
        normal: "10 minutes de marche.",
        ambitious: "20 minutes de méditation.",
      };

      aiService.generateObjectives.mockResolvedValue(objectives);

      const body = { theme: "gestion du stress", locale: "fr-BE" };

      const result = await controller.generateObjectives(body as any);

      expect(aiService.generateObjectives).toHaveBeenCalledTimes(1);
      expect(aiService.generateObjectives).toHaveBeenCalledWith("gestion du stress", "fr-BE");
      expect(result).toEqual(objectives);
    });

    it("si theme est absent, passe '' (conformément au controller) au service", async () => {
      const objectives = {
        easy: "x",
        normal: "y",
        ambitious: "z",
      };

      aiService.generateObjectives.mockResolvedValue(objectives);

      const body = { locale: "en-US" };

      const result = await controller.generateObjectives(body as any);

      expect(aiService.generateObjectives).toHaveBeenCalledWith("", "en-US");
      expect(result).toEqual(objectives);
    });
  });
});
