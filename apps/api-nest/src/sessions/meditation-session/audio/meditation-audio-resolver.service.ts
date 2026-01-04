import { Injectable } from "@nestjs/common";
import { ExternalAudioProvider } from "./external-audio-provider";
import { AudioStreamResolver } from "./audio-stream-resolver.interface";

/**
 * Orchestrateur de résolution audio.
 *
 * @remarks
 * Centralise la logique de sélection du resolver (Audius, SoundCloud, etc.)
 * et applique une règle simple:
 * - si `mediaUrl` est défini, il est utilisé en priorité;
 * - sinon, si un provider externe est défini, tente de résoudre via le resolver;
 * - sinon, aucun média disponible.
 */
@Injectable()
export class MeditationAudioResolverService {
  constructor(private readonly resolvers: AudioStreamResolver[]) {}

  /**
   * Résout l’URL audio finale à partir d’un contenu.
   *
   * @param input Informations audio d’un contenu (ex: entité Prisma).
   * @returns URL de stream finale ou `null`.
   */
  async resolveFromContent(input: {
    mediaUrl?: string | null;
    externalAudioProvider?: ExternalAudioProvider | null;
    externalAudioRef?: string | null;
  }): Promise<string | null> {
    const mediaUrl = (input.mediaUrl ?? "").trim();
    if (mediaUrl) return mediaUrl;

    const provider = input.externalAudioProvider ?? null;
    const ref = (input.externalAudioRef ?? "").trim();
    if (!provider || !ref) return null;

    const resolver = this.resolvers.find((r) => r.supports(provider));
    if (!resolver) return null;

    return resolver.resolve(ref);
  }
}
