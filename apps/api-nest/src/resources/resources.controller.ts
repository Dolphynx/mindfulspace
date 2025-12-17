import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
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

  /**
   * Get all tags (for form dropdowns)
   *
   * @returns List of all resource tags
   */
  @Public()
  @Get('tags/all')
  findAllTags() {
    return this.resourcesService.findAllTags();
  }

  /**
   * Create a new resource
   * Only coaches and admins can create resources
   * Author is automatically set from JWT token
   *
   * @param userId - User ID from JWT
   * @param dto - Resource data
   * @returns Created resource
   */
  @Post()
  @Roles('coach', 'admin')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateResourceDto,
  ) {
    return this.resourcesService.create(userId, dto);
  }

  /**
   * Update an existing resource
   * Owners can update their own resources, admins can update any resource
   * Only admins can set isFeatured flag
   *
   * @param resourceId - Resource UUID
   * @param userId - Current user ID from JWT
   * @param userRoles - Current user roles from JWT
   * @param dto - Updated resource data
   * @returns Updated resource
   */
  @Put(':id')
  @Roles('coach', 'admin')
  update(
    @Param('id') resourceId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(resourceId, userId, userRoles, dto);
  }

  /**
   * Delete a resource
   * Owners can delete their own resources, admins can delete any resource
   * Coaches cannot delete resources linked to meditation programs
   *
   * @param resourceId - Resource UUID
   * @param userId - Current user ID from JWT
   * @param userRoles - Current user roles from JWT
   */
  @Delete(':id')
  @Roles('coach', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResource(
    @Param('id') resourceId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('roles') userRoles: string[],
  ) {
    await this.resourcesService.delete(resourceId, userId, userRoles);
  }

  /**
   * Get all resources created by the current user
   * Used for coach dashboard to show "my resources"
   *
   * @param userId - Current user ID from JWT
   * @returns List of user's resources
   */
  @Get('my-resources/list')
  @Roles('coach', 'admin')
  findMyResources(@CurrentUser('id') userId: string) {
    return this.resourcesService.findByAuthor(userId);
  }
}
