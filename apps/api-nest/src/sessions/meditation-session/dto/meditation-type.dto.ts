/**
 * DTO exposé par l’API pour représenter un type de méditation.
 *
 * Ce modèle correspond exactement à ce que Swagger documente
 * et ce que le front consomme via les endpoints `/meditation/types`.
 *
 * Points importants :
 * - On n’expose pas d’autres champs internes Prisma.
 * - Les propriétés obligatoires utilisent `!` pour indiquer à TS
 *   qu’elles seront toujours définies après instanciation (class DTO).
 * - `sortOrder` est optionnel afin de refléter la valeur en base.
 */
export class MeditationTypeDto {
  /** Identifiant unique du type de méditation. */
  id!: string;

  /** Slug technique (stable) utilisé par le front pour les traductions. */
  slug!: string;

  /** Indique si le type est actif pour le catalogue front. */
  isActive!: boolean;

  /**
   * Ordre d’affichage facultatif.
   * Peut être `null` si aucun ordre spécifique n’a été défini.
   */
  sortOrder?: number | null;
}
