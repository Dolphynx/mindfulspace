import { of } from "rxjs";
import { SoundCloudResolverService } from "./soundcloud-resolver.service";

/**
 * Mock du Logger NestJS afin de supprimer les sorties de logs durant les tests unitaires.
 *
 * @remarks
 * Le logging n’est pas un comportement fonctionnel attendu dans ces tests.
 */
jest.mock("@nestjs/common", () => {
  const original = jest.requireActual("@nestjs/common");
  return {
    ...original,
    Logger: class {
      warn(): void {}
      error(): void {}
      log(): void {}
      debug(): void {}
      verbose(): void {}
    },
  };
});

/**
 * Tests unitaires pour {@link SoundCloudResolverService}.
 *
 * @remarks
 * Ces tests valident :
 * - l’absence d’appel réseau si `SOUNDCLOUD_CLIENT_ID` est manquant,
 * - la résolution correcte d’une URL de stream via l’API SoundCloud,
 * - le fallback `null` si la réponse est incomplète.
 */
describe("SoundCloudResolverService", () => {
  function makeService() {
    const http = {
      get: jest.fn(),
    };

    const service = new SoundCloudResolverService(http as any);
    return { service, http };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.SOUNDCLOUD_CLIENT_ID;
  });

  it("returns null and does not call HttpService when client id is missing", async () => {
    const { service, http } = makeService();

    const result = await service.resolveStreamUrl(
      "https://soundcloud.com/artist/track",
    );

    expect(result).toBeNull();
    expect(http.get).not.toHaveBeenCalled();
  });

  it("calls SoundCloud resolve and appends client id when configured", async () => {
    process.env.SOUNDCLOUD_CLIENT_ID = "client_123";

    const { service, http } = makeService();

    http.get.mockReturnValue(
      of({
        data: { stream_url: "https://api.soundcloud.com/stream/abc" },
      }),
    );

    const result = await service.resolveStreamUrl(
      "https://soundcloud.com/artist/track",
    );

    expect(http.get).toHaveBeenCalledWith(
      "https://api.soundcloud.com/resolve",
      expect.objectContaining({
        params: {
          url: "https://soundcloud.com/artist/track",
          client_id: "client_123",
        },
      }),
    );

    expect(result).toBe("https://api.soundcloud.com/stream/abc?client_id=client_123");
  });

  it("returns null when SoundCloud resolve does not return stream_url", async () => {
    process.env.SOUNDCLOUD_CLIENT_ID = "client_123";

    const { service, http } = makeService();

    http.get.mockReturnValue(
      of({
        data: {},
      }),
    );

    const result = await service.resolveStreamUrl(
      "https://soundcloud.com/artist/track",
    );

    expect(result).toBeNull();
  });
});
