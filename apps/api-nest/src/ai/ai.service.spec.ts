import { InternalServerErrorException, Logger } from "@nestjs/common";
import { AiService } from "./ai.service";

/**
 * Mock du Logger Nest pour ne pas polluer la sortie de tests.
 */
jest.mock("@nestjs/common", () => {
    const original = jest.requireActual("@nestjs/common");
    return {
        ...original,
        Logger: class {
            error(): void {}
            log(): void {}
            warn(): void {}
            debug(): void {}
            verbose(): void {}
        },
    };
});

/**
 * Mock de groq-sdk.
 *
 * @remarks
 * Le service instancie `new Groq({ apiKey })` puis appelle
 * `client.chat.completions.create(...)`.
 * On reproduit cette surface minimale.
 */
const createMock = jest.fn();

jest.mock("groq-sdk", () => {
    return {
        __esModule: true,
        default: class Groq {
            public chat = {
                completions: {
                    create: createMock,
                },
            };

            constructor(_: any) {}
        },
    };
});

/**
 * Tests unitaires du {@link AiService}.
 *
 * @remarks
 * Objectifs :
 * - vérifier la gestion de la clé API (ensureApiKey),
 * - valider les helpers (sanitizeText, normalizeLocale),
 * - tester les scénarios d’appel bas niveau (callGroq) :
 *   - réponse vide => exception
 *   - exception du provider => exception
 * - tester la logique métier :
 *   - generateMantra / generateEncouragement : prompt + sanitize
 *   - generateObjectives : thème obligatoire + parsing JSON robuste
 *
 * ⚠️ Comme `callGroq`, `sanitizeText`, `normalizeLocale` sont privés,
 * on utilise `(service as any)` pour les tester.
 * C’est acceptable ici car c’est du test unitaire “boîte blanche” ciblé.
 */
describe("AiService", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...OLD_ENV };
        delete process.env.GROQ_API_KEY;
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    describe("ensureApiKey", () => {
        it("lève une erreur si GROQ_API_KEY est absente", () => {
            process.env.GROQ_API_KEY = undefined;

            const service = new AiService();
            expect(() => (service as any).ensureApiKey()).toThrow(InternalServerErrorException);
        });

        it("lève une erreur si GROQ_API_KEY vaut 'missing-key'", () => {
            process.env.GROQ_API_KEY = "missing-key";

            const service = new AiService();
            expect(() => (service as any).ensureApiKey()).toThrow(InternalServerErrorException);
        });

        it("ne lève pas si GROQ_API_KEY est définie", () => {
            process.env.GROQ_API_KEY = "real-key";

            const service = new AiService();
            expect(() => (service as any).ensureApiKey()).not.toThrow();
        });
    });

    describe("normalizeLocale", () => {
        it('normalise "fr-BE" => "fr", "en-US" => "en", undefined => "fr"', () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            expect((service as any).normalizeLocale("fr-BE")).toBe("fr");
            expect((service as any).normalizeLocale("en-US")).toBe("en");
            expect((service as any).normalizeLocale(undefined)).toBe("fr");
        });
    });

    describe("sanitizeText", () => {
        it("retire les guillemets / quotes externes et trim", () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            expect((service as any).sanitizeText('"Bonjour"')).toBe("Bonjour");
            expect((service as any).sanitizeText("   “Bonjour”   ")).toBe("Bonjour");
            expect((service as any).sanitizeText("« Bonjour »")).toBe("Bonjour");
            expect((service as any).sanitizeText("`Bonjour`")).toBe("Bonjour");
            expect((service as any).sanitizeText("  Bonjour  ")).toBe("Bonjour");
        });

        it("gère des quotes imbriquées (plusieurs couches)", () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            expect((service as any).sanitizeText('""Bonjour""')).toBe("Bonjour");
            expect((service as any).sanitizeText("«“Bonjour”»")).toBe("Bonjour");
        });
    });

    describe("callGroq", () => {
        it("appelle Groq avec le modèle attendu et retourne le texte si présent", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            createMock.mockResolvedValue({
                choices: [{ message: { content: "Une réponse IA." } }],
            });

            const result = await (service as any).callGroq("hello", 80);

            expect(createMock).toHaveBeenCalledTimes(1);
            expect(createMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "llama-3.1-8b-instant",
                    max_tokens: 80,
                    temperature: 0.7,
                    messages: expect.any(Array),
                }),
            );

            expect(result).toBe("Une réponse IA.");
        });

        it("retourne une erreur si le provider renvoie un message vide", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            createMock.mockResolvedValue({
                choices: [{ message: { content: "" } }],
            });

            await expect((service as any).callGroq("x", 80)).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
        });

        it("retourne une erreur si le provider throw", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            createMock.mockRejectedValue(new Error("boom"));

            await expect((service as any).callGroq("x", 80)).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
        });

        it('supprime le suffixe "C\'est un mantra" si présent (comportement actuel)', async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            createMock.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: "Respire doucement. C'est un mantra (explication inutile)",
                        },
                    },
                ],
            });

            const result = await (service as any).callGroq("x", 80);
            expect(result).toBe("Respire doucement.");
        });
    });

    describe("generateMantra", () => {
        it("utilise normalizeLocale + callGroq(…, 80) + sanitizeText", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            const callSpy = jest
                .spyOn(service as any, "callGroq")
                .mockResolvedValue('  "Hello world"  ');

            const result = await service.generateMantra("stress", "en-US");

            expect(callSpy).toHaveBeenCalledTimes(1);
            // Vérifie le maxTokens du mantra
            expect(callSpy.mock.calls[0][1]).toBe(80);
            // Vérifie que la locale normalisée "en" est injectée dans le prompt
            expect(callSpy.mock.calls[0][0]).toContain('"en"');

            expect(result).toBe("Hello world");
        });
    });

    describe("generateEncouragement", () => {
        it("utilise normalizeLocale + callGroq(…, 80) + sanitizeText", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            const callSpy = jest
                .spyOn(service as any, "callGroq")
                .mockResolvedValue("« Tu vas y arriver. »");

            const result = await service.generateEncouragement("motivation", "fr-BE");

            expect(callSpy).toHaveBeenCalledTimes(1);
            expect(callSpy.mock.calls[0][1]).toBe(80);
            expect(callSpy.mock.calls[0][0]).toContain('"fr"');

            expect(result).toBe("Tu vas y arriver.");
        });
    });

    describe("generateObjectives", () => {
        it("lève une erreur si le thème est vide/après trim", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            await expect(service.generateObjectives("   ", "fr")).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
        });

        it("parse un JSON strict et renvoie { easy, normal, ambitious }", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            jest
                .spyOn(service as any, "callGroq")
                .mockResolvedValue(
                    JSON.stringify({
                        easy: "5 minutes.",
                        normal: "10 minutes.",
                        ambitious: "20 minutes.",
                    }),
                );

            const result = await service.generateObjectives("stress", "fr-BE");

            expect(result).toEqual({
                easy: "5 minutes.",
                normal: "10 minutes.",
                ambitious: "20 minutes.",
            });
        });

        it("tolère du texte autour tant qu’un objet JSON est détectable (extraction {..})", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            jest.spyOn(service as any, "callGroq").mockResolvedValue(
                [
                    "Voici tes objectifs :",
                    "{",
                    '"easy":"A",',
                    '"normal":"B",',
                    '"ambitious":"C"',
                    "}",
                    "Bonne journée !",
                ].join("\n"),
            );

            const result = await service.generateObjectives("stress", "fr");

            expect(result).toEqual({ easy: "A", normal: "B", ambitious: "C" });
        });

        it("accepte un wrapper objet à clé unique si la valeur contient les objectifs", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            jest.spyOn(service as any, "callGroq").mockResolvedValue(
                JSON.stringify({
                    data: { easy: "A", normal: "B", ambitious: "C" },
                }),
            );

            const result = await service.generateObjectives("stress", "fr");

            expect(result).toEqual({ easy: "A", normal: "B", ambitious: "C" });
        });

        it("lève une erreur si le JSON est invalide ou ne correspond pas au format attendu", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            jest.spyOn(service as any, "callGroq").mockResolvedValue('{"easy":1}');

            await expect(service.generateObjectives("stress", "fr")).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
        });

        it("lève une erreur si aucun JSON n'est détecté dans la réponse", async () => {
            process.env.GROQ_API_KEY = "real-key";
            const service = new AiService();

            jest.spyOn(service as any, "callGroq").mockResolvedValue("pas de json ici");

            await expect(service.generateObjectives("stress", "fr")).rejects.toBeInstanceOf(
                InternalServerErrorException,
            );
        });
    });
});
