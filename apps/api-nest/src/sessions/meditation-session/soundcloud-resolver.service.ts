import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface SoundCloudResolveResponse {
  stream_url?: string;
}

/**
 * Service d’intégration SoundCloud.
 *
 * @remarks
 * Ce service encapsule la résolution d’une URL SoundCloud (track) vers une URL de stream
 * exploitable côté client.
 *
 * Comportement :
 * - si `SOUNDCLOUD_CLIENT_ID` n’est pas configuré, retourne `null` sans appel réseau ;
 * - si SoundCloud ne renvoie pas de `stream_url` valide, retourne `null` ;
 * - en cas d’erreur réseau, logue et retourne `null`.
 */
@Injectable()
export class SoundCloudResolverService {
  private readonly logger = new Logger(SoundCloudResolverService.name);

  constructor(private readonly http: HttpService) {}

  /**
   * Résout une URL SoundCloud (track) en URL de stream.
   *
   * @param trackUrl URL publique SoundCloud (ex: https://soundcloud.com/...).
   * @returns URL de stream avec `client_id`, ou `null` si non résoluble.
   */
  async resolveStreamUrl(trackUrl: string): Promise<string | null> {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) {
      this.logger.warn(
        "SOUNDCLOUD_CLIENT_ID is not set, cannot resolve SoundCloud URLs.",
      );
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<SoundCloudResolveResponse>(
          "https://api.soundcloud.com/resolve",
          {
            params: { url: trackUrl, client_id: clientId },
          },
        ),
      );

      const data = response.data;
      if (!data || typeof data.stream_url !== "string") {
        this.logger.warn(
          `SoundCloud resolve did not return a valid stream_url for ${trackUrl}`,
        );
        return null;
      }

      return `${data.stream_url}?client_id=${clientId}`;
    } catch (error) {
      this.logger.error(
        `Error while resolving SoundCloud URL ${trackUrl}: ${String(error)}`,
      );
      return null;
    }
  }
}
