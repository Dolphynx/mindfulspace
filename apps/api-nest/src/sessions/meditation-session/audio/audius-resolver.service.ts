import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

import { AudioStreamResolver } from "./audio-stream-resolver.interface";
import { ExternalAudioProvider } from "./external-audio-provider";

interface AudiusResolveResponse {
  data?: Array<{
    id?: string;
    track_id?: string;
  }>;
}

/**
 * Resolver Audius.
 *
 * @remarks
 * Audius permet d’obtenir un stream audio via un endpoint de type:
 * `/v1/tracks/:track_id/stream`.
 *
 * Cette implémentation supporte deux formats de référence:
 * - `ref` = `track_id` (recommandé) : construction directe de l’URL stream.
 * - `ref` = URL Audius : appel à `/v1/resolve?url=...` puis extraction de l’id.
 */
@Injectable()
export class AudiusResolverService implements AudioStreamResolver {
  private readonly logger = new Logger(AudiusResolverService.name);

  /**
   * Base URL Audius.
   *
   * @remarks
   * Valeur par défaut: `https://api.audius.co`.
   * Peut être surchargée via `AUDIUS_API_BASE_URL`.
   */
  private readonly baseUrl =
    process.env.AUDIUS_API_BASE_URL?.trim() || "https://api.audius.co";

  constructor(private readonly http: HttpService) {}

  /** {@inheritDoc AudioStreamResolver.supports} */
  supports(provider: ExternalAudioProvider): boolean {
    return provider === ExternalAudioProvider.AUDIUS;
  }

  /** {@inheritDoc AudioStreamResolver.resolve} */
  async resolve(ref: string): Promise<string | null> {
    const trimmed = (ref ?? "").trim();
    if (!trimmed) return null;

    try {
      // Cas 1: track_id explicite (UUID-like ou numérique). On accepte large et on construit l’URL.
      if (!this.looksLikeUrl(trimmed)) {
        return this.buildStreamUrl(trimmed);
      }

      // Cas 2: URL Audius -> resolve via API
      const trackId = await this.resolveTrackIdFromUrl(trimmed);
      if (!trackId) return null;

      return this.buildStreamUrl(trackId);
    } catch (error) {
      this.logger.error(
        `Failed to resolve Audius ref "${trimmed}": ${String(error)}`,
      );
      return null;
    }
  }

  /**
   * Construit l’URL de stream Audius à partir d’un id.
   * @param trackId Identifiant de piste Audius.
   */
  private buildStreamUrl(trackId: string): string {
    const safeId = encodeURIComponent(trackId);
    return `${this.baseUrl}/v1/tracks/${safeId}/stream`;
  }

  /**
   * Résout un `track_id` Audius depuis une URL publique.
   * @param url URL Audius.
   */
  private async resolveTrackIdFromUrl(url: string): Promise<string | null> {
    const endpoint = `${this.baseUrl}/v1/resolve?url=${encodeURIComponent(url)}`;

    const response = await firstValueFrom(this.http.get<AudiusResolveResponse>(endpoint));
    const data = response?.data;

    const item = data?.data?.[0];
    const id = item?.id ?? item?.track_id;
    return id ? String(id) : null;
  }

  /**
   * Détecte grossièrement si une chaîne ressemble à une URL.
   * @param value Chaîne à tester.
   */
  private looksLikeUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }
}
