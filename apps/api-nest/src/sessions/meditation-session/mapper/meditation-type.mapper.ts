import type { MeditationType } from '@prisma/client';
import type { MeditationTypeDto } from '../dto/meditation-type.dto';

/**
 * Mappe une entité Prisma `MeditationType` vers un `MeditationTypeDto`
 * exposé par l’API.
 *
 * Ce mapper permet :
 * - de contrôler précisément la forme des objets renvoyés au front,
 * - d’éviter d’exposer des champs internes de la base,
 * - d’aligner la réponse réelle avec le contrat décrit dans Swagger
 *   (via `MeditationTypeDto` et ses décorateurs éventuels `@ApiProperty`).
 *
 * @param model Instance Prisma de `MeditationType` issue de la base de données.
 * @returns DTO prêt à être sérialisé et documenté dans l’API.
 */
export function mapMeditationTypeToDto(model: MeditationType): MeditationTypeDto {
  return {
    id: model.id,
    slug: model.slug,
    isActive: model.isActive,
    sortOrder: model.sortOrder,
  };
}
