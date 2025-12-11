import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * Contrôleur responsable de l’exposition des ressources via l’API.
 *
 * @remarks
 * Il expose les points d’accès REST suivants :
 *
 * - **GET `/resources`** :
 *   liste paginable/filtrable des ressources (recherche texte, catégorie, …).
 * - **GET `/resources/categories`** :
 *   liste des catégories de ressources, avec comptage associé.
 * - **GET `/resources/:slug`** :
 *   récupération des détails d’une ressource individuelle via son slug.
 *
 * Toute la logique métier et l’accès aux données sont délégués au
 * service {@link ResourcesService}.
 *
 * @see ResourcesService
 *
 * @remarks Swagger
 * Les décorateurs Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, …)
 * peuvent être ajoutés directement sur les méthodes si nécessaire.
 */
@Controller("resources")
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * Récupère la liste des ressources, éventuellement filtrées.
   *
   * @remarks
   * Les filtres supportés sont :
   * - `q` : terme de recherche libre (titre, résumé, tags…),
   * - `categorySlug` : slug de catégorie pour restreindre les résultats.
   *
   * @param query Paramètres de filtrage mappés via {@link GetResourcesDto}.
   * @returns Une liste de ressources correspondant aux critères fournis.
   */
  @Public()
  @Get()
  findAll(@Query() query: GetResourcesDto) {
    return this.resourcesService.findAll(query);
  }

  /**
   * Récupère la liste des catégories de ressources.
   *
   * @remarks
   * Chaque catégorie inclut un compteur `_count.resources` indiquant le
   * nombre de ressources associées. Le tri est effectué alphabétiquement
   * sur le nom de la catégorie.
   *
   * @returns Les catégories disponibles, avec leur nombre de ressources.
   */
  @Public()
  @Get("categories")
  findCategories() {
    return this.resourcesService.findCategories();
  }

  /**
   * Récupère une ressource unique identifiée par son slug.
   *
   * @param slug Identifiant textuel unique de la ressource.
   * @returns La ressource correspondante si elle existe.
   *
   * @throws NotFoundException si aucune ressource ne correspond au slug.
   */
  @Roles('premium', 'admin')
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.resourcesService.findOneBySlug(slug);
  }
}
