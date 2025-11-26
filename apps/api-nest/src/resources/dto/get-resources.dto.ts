import { IsOptional, IsString } from "class-validator";

/**
 * DTO utilisé pour filtrer la liste des ressources lors d'une requête GET.
 * Permet de transmettre des critères facultatifs tels qu'une recherche
 * textuelle ou le filtre par catégorie via son slug.
 */
export class GetResourcesDto {
  /**
   * Terme de recherche libre appliqué sur le titre, le résumé
   * ou les tags des ressources.
   */
  @IsOptional()
  @IsString()
  q?: string;

  /**
   * Slug de la catégorie permettant de filtrer les ressources
   * appartenant à une catégorie spécifique.
   */
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
