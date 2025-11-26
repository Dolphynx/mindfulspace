import type { MeditationContent } from '@prisma/client';
import type { MeditationContentDto } from '../dto/meditation-content.dto';

/**
 * Convertit une entité Prisma `MeditationContent` en `MeditationContentDto`
 * destiné à être renvoyé par l’API.
 *
 * Objectifs du mapper :
 * - garantir que seules les propriétés prévues par le contrat Swagger
 *   (défini dans `MeditationContentDto`) soient exposées au front ;
 * - découpler la structure interne de la base de données de la structure
 *   publique renvoyée par l’API ;
 * - assurer une stabilité de l’interface même si le schéma Prisma évolue.
 *
 * Notes :
 * - `defaultMeditationTypeId` du modèle Prisma est renommé en `meditationTypeId`
 *   dans le DTO pour correspondre aux attentes du front.
 * - Ce mapper peut être complété si de nouvelles propriétés sont ajoutées
 *   au DTO ou au modèle.
 *
 * @param model Entité Prisma représentant un contenu de méditation.
 * @returns DTO propre et documenté à renvoyer au client API.
 */
export function mapMeditationContentToDto(model: MeditationContent): MeditationContentDto {
  return {
    id: model.id,
    title: model.title,
    description: model.description,
    meditationTypeId: model.defaultMeditationTypeId,
    mode: model.mode,
    minDurationSeconds: model.minDurationSeconds,
    maxDurationSeconds: model.maxDurationSeconds,
    defaultDurationSeconds: model.defaultDurationSeconds,
    sortOrder: model.sortOrder,
    isPremium: model.isPremium,
  };
}
