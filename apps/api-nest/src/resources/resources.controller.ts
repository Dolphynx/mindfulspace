import { Controller, Get, Param, Query } from '@nestjs/common';
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";

/**
 * Contrôleur responsable de l’exposition des ressources via l’API.
 * Il délègue l’ensemble de la logique métier au `ResourcesService`
 * et fournit les points d’accès publics pour la récupération des
 * ressources, catégories et détails individuels.
 */
@Controller("resources")
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * Récupère l’ensemble des ressources, avec possibilité de filtrage
   * via les paramètres de requête définis dans `GetResourcesDto`.
   *
   * @param query - Paramètres de filtrage et pagination.
   * @returns Liste des ressources correspondant aux critères fournis.
   */
  @Get()
  findAll(@Query() query: GetResourcesDto) {
    return this.resourcesService.findAll(query);
  }

  /**
   * Récupère la liste complète des catégories de ressources.
   *
   * @returns Tableau typé des catégories disponibles.
   */
  @Get("categories")
  findCategories() {
    return this.resourcesService.findCategories();
  }

  /**
   * Récupère une ressource unique identifiée par son slug.
   *
   * @param slug - Identifiant textuel unique de la ressource.
   * @returns La ressource correspondante si elle existe.
   */
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.resourcesService.findOneBySlug(slug);
  }
}
