import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { AudioStreamResolver } from "./audio-stream-resolver.interface";
import { ExternalAudioProvider } from "./external-audio-provider";

interface SoundCloudResolveResponse {
  stream_url?: string;
}

/**
 * Resolver SoundCloud.
 *
 * @remarks
 * Cette implémentation nécessite une clé/API (ex: `SOUNDCLOUD_CLIENT_ID`) pour
 * résoudre une URL publique vers une URL de stream exploitable.
 *
 * Tant que la clé n’est pas configurée, {@link resolve} retourne `null`.
 * Cela permet de conserver un design multi-provider sans casser les usages.
 */
@Injectable()
export class SoundCloudResolverService implements AudioStreamResolver {
  private readonly logger = new Logger(SoundCloudResolverService.name);

  constructor(private readonly http: HttpService) {}

  /** {@inheritDoc AudioStreamResolver.supports} */
  supports(provider: ExternalAudioProvider): boolean {
    return provider === ExternalAudioProvider.SOUNDCLOUD;
  }

  /** {@inheritDoc AudioStreamResolver.resolve} */
  async resolve(ref: string): Promise<string | null> {
    const trackUrl = (ref ?? "").trim();
    if (!trackUrl) return null;

    const clientId = process.env.SOUNDCLOUD_CLIENT_ID?.trim();
    if (!clientId) {
      this.logger.warn(
        "SoundCloud resolver called but SOUNDCLOUD_CLIENT_ID is not configured.",
      );
      return null;
    }

    try {
      const endpoint = `https://api.soundcloud.com/resolve.json?url=${encodeURIComponent(
        trackUrl,
      )}&client_id=${encodeURIComponent(clientId)}`;

      const response = await firstValueFrom(
        this.http.get<SoundCloudResolveResponse>(endpoint),
      );

      const streamUrl = response?.data?.stream_url;
      if (!streamUrl) return null;

      return `${streamUrl}?client_id=${encodeURIComponent(clientId)}`;
    } catch (error) {
      this.logger.error(
        `Error while resolving SoundCloud ref "${trackUrl}": ${String(error)}`,
      );
      return null;
    }
  }
}
