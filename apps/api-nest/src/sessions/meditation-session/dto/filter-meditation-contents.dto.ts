import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO utilisé pour valider les filtres du endpoint
 * `GET /meditation/contents`.
 *
 * Ce DTO correspond strictement aux paramètres que le front peut fournir :
 *
 * - **meditationTypeId** : identifiant du type de méditation sélectionné
 *   (ex. "breathing", "body-scan", …).
 *   Permet de filtrer les contenus associés.
 *
 * - **durationSeconds** : durée cible exprimée en secondes.
 *   Si fournie, le service applique une logique min/max pour déterminer
 *   quels contenus sont compatibles.
 *
 * Tous les champs sont optionnels afin de permettre un endpoint flexible,
 * mais côté service `meditationTypeId` reste requis (sinon erreur métier).
 *
 * Le DTO sert également de base à la documentation Swagger.
 */
export class FilterMeditationContentsDto {
  /** Identifiant du type de méditation choisi par l'utilisateur. */
  @IsOptional()
  @IsString()
  meditationTypeId?: string;

  /**
   * Durée souhaitée en secondes.
   * Doit être un entier positif (≥ 1).
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}
