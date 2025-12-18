import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CurrentUserType } from "@mindfulspace/api/auth/types/current-user.type";

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
 *   récupération des détails d’une ressource individuelle via son slug,
 *   avec gestion des ressources premium (via les rôles utilisateur).
 *
 * Toute la logique métier et l’accès aux données sont délégués au
 * service {@link ResourcesService}.
 *
 * @see ResourcesService
 *
 * @remarks Swagger
 * Les décorateurs Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, …)
 * peuvent être ajoutés directement sur les méthodes si nécessaire
 * dans ce contrôleur.
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
   * Le DTO {@link GetResourcesDto} gère la validation et la
   * transformation des paramètres de requête.
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
   * Récupère une ressource unique identifiée par son slug, en appliquant
   * les règles d’accès premium selon les rôles de l’utilisateur.
   *
   * @remarks
   * - La route est marquée `@Public()`, ce qui permet un accès anonyme.
   * - Si la ressource est premium, l’accès n’est autorisé que pour les
   *   utilisateurs possédant le rôle `premium` ou `admin`.
   * - La logique de contrôle d’accès est implémentée dans
   *   {@link ResourcesService.findOneBySlugForUser}.
   *
   * @param slug Identifiant textuel unique de la ressource.
   * @param user Utilisateur courant (optionnel), injecté via `@CurrentUser()`
   *             à partir du token JWT lorsqu’il est présent.
   * @returns La ressource correspondante si elle existe et que l’accès est autorisé.
   *
   * @throws NotFoundException si aucune ressource ne correspond au slug.
   * @throws ForbiddenException si la ressource est premium et que l’utilisateur
   *         n’a pas les droits nécessaires.
   */
  // @Roles('premium', 'admin')
  @Public()
  @Get(":slug")
  findOne(
    @Param("slug") slug: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    // return this.resourcesService.findOneBySlug(slug);
    return this.resourcesService.findOneBySlugForUser(slug, user);
  }
}
