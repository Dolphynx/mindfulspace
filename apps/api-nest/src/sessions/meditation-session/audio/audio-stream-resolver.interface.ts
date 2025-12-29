import { ExternalAudioProvider } from "./external-audio-provider";

/**
 * Contrat de résolution d’un contenu audio externe vers une URL de stream lisible par le client.
 *
 * @remarks
 * Un resolver prend une référence externe (ID, URL publique, etc.) et retourne une URL
 * directement consommable par une balise `<audio>` (ou équivalent).
 */
export interface AudioStreamResolver {
  /**
   * Indique si le resolver est compatible avec un provider.
   * @param provider Provider externe.
   */
  supports(provider: ExternalAudioProvider): boolean;

  /**
   * Résout une référence externe vers une URL de stream.
   *
   * @param ref Référence du contenu (ID track, URL publique, etc.).
   * @returns URL de stream consommable côté client, ou `null` si non résoluble.
   */
  resolve(ref: string): Promise<string | null>;
}
