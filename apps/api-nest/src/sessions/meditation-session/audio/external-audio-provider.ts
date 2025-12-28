/**
 * Providers externes supportés pour les contenus audio.
 *
 * @remarks
 * Cette enum est utilisée côté API (services) et peut être reflétée côté Prisma
 * via une enum DB. Elle doit rester stable (valeurs en MAJUSCULES).
 */
export enum ExternalAudioProvider {
  AUDIUS = "AUDIUS",
  SOUNDCLOUD = "SOUNDCLOUD",
}
