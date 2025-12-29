import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
import { AutoTranslateDto } from "./dto/auto-translate.dto";
import { CreateTranslationDto } from "./dto/create-translation.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
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

  /**
   * Get all translations for a resource
   * Public endpoint to retrieve all available language versions
   *
   * @param resourceId - Resource UUID
   * @returns List of translations for this resource
   */
  @Public()
  @Get(':id/translations')
  getTranslations(@Param('id') resourceId: string) {
    return this.resourcesService.getTranslations(resourceId);
  }

  /**
   * Create or update a translation for a specific locale
   * Coaches can manage translations for their own resources, admins for any resource
   *
   * @param resourceId - Resource UUID
   * @param locale - Target locale (e.g., "en", "fr")
   * @param dto - Translation data (title, summary, content)
   * @returns Created or updated translation
   */
  @Put(':id/translations/:locale')
  @Roles('coach', 'admin')
  updateTranslation(
    @Param('id') resourceId: string,
    @Param('locale') locale: string,
    @Body() dto: CreateTranslationDto,
  ) {
    return this.resourcesService.upsertTranslation(resourceId, locale, dto);
  }

  /**
   * Auto-translate a resource to multiple target locales using AI
   * Uses AI to translate title, summary, and content from source locale
   * Coaches can auto-translate their own resources, admins can translate any resource
   *
   * @param resourceId - Resource UUID
   * @param dto - Contains array of target locales (e.g., ["en", "es"])
   * @returns Array of created/updated translations
   */
  @Post(':id/auto-translate')
  @Roles('coach', 'admin')
  autoTranslate(
    @Param('id') resourceId: string,
    @Body() dto: AutoTranslateDto,
  ) {
    return this.resourcesService.autoTranslate(resourceId, dto);
  }

  // ========================================
  // CATEGORY MANAGEMENT ENDPOINTS (ADMIN ONLY)
  // ========================================

  /**
   * Create a new resource category
   * Admin-only endpoint
   *
   * @param dto - Category creation data (name, slug, iconEmoji)
   * @returns Created category object
   */
  @Post('admin/categories')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.resourcesService.createCategory(dto);
  }

  /**
   * Update an existing resource category
   * Admin-only endpoint
   *
   * @param categoryId - Category UUID
   * @param dto - Category update data (partial)
   * @returns Updated category object
   */
  @Put('admin/categories/:categoryId')
  @Roles('admin')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.resourcesService.updateCategory(categoryId, dto);
  }

  /**
   * Delete a resource category
   * Admin-only endpoint
   * Cannot delete if resources are still using this category
   *
   * @param categoryId - Category UUID
   * @returns Success message
   */
  @Delete('admin/categories/:categoryId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.resourcesService.deleteCategory(categoryId);
  }

  // ========================================
  // TAG MANAGEMENT ENDPOINTS (ADMIN ONLY)
  // ========================================

  /**
   * Create a new resource tag
   * Admin-only endpoint
   *
   * @param dto - Tag creation data (name, slug)
   * @returns Created tag object
   */
  @Post('admin/tags')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  createTag(@Body() dto: CreateTagDto) {
    return this.resourcesService.createTag(dto);
  }

  /**
   * Update an existing resource tag
   * Admin-only endpoint
   *
   * @param tagId - Tag UUID
   * @param dto - Tag update data (partial)
   * @returns Updated tag object
   */
  @Put('admin/tags/:tagId')
  @Roles('admin')
  updateTag(
    @Param('tagId') tagId: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.resourcesService.updateTag(tagId, dto);
  }

  /**
   * Delete a resource tag
   * Admin-only endpoint
   * Can delete even if resources are using this tag
   *
   * @param tagId - Tag UUID
   * @returns Success message
   */
  @Delete('admin/tags/:tagId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  deleteTag(@Param('tagId') tagId: string) {
    return this.resourcesService.deleteTag(tagId);
  }

  // ========================================
  // CATEGORY TRANSLATION ENDPOINTS (ADMIN ONLY)
  // ========================================

  /**
   * Get all translations for a category
   * Public endpoint to retrieve all available language versions
   *
   * @param categoryId - Category UUID
   * @returns List of translations for this category
   */
  @Public()
  @Get('categories/:categoryId/translations')
  getCategoryTranslations(@Param('categoryId') categoryId: string) {
    return this.resourcesService.getCategoryTranslations(categoryId);
  }

  /**
   * Create or update a translation for a specific category
   * Admin-only endpoint
   *
   * @param categoryId - Category UUID
   * @param locale - Target locale (e.g., "en", "fr")
   * @param dto - Translation data (name)
   * @returns Created or updated translation
   */
  @Put('admin/categories/:categoryId/translations/:locale')
  @Roles('admin')
  upsertCategoryTranslation(
    @Param('categoryId') categoryId: string,
    @Param('locale') locale: string,
    @Body() dto: { name: string },
  ) {
    return this.resourcesService.upsertCategoryTranslation(categoryId, locale, dto);
  }

  /**
   * Delete a translation for a specific category
   * Admin-only endpoint
   * Cannot delete source locale translation
   *
   * @param categoryId - Category UUID
   * @param locale - Target locale to delete
   * @returns Success message
   */
  @Delete('admin/categories/:categoryId/translations/:locale')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  deleteCategoryTranslation(
    @Param('categoryId') categoryId: string,
    @Param('locale') locale: string,
  ) {
    return this.resourcesService.deleteCategoryTranslation(categoryId, locale);
  }

  // ========================================
  // TAG TRANSLATION ENDPOINTS (ADMIN ONLY)
  // ========================================

  /**
   * Get all translations for a tag
   * Public endpoint to retrieve all available language versions
   *
   * @param tagId - Tag UUID
   * @returns List of translations for this tag
   */
  @Public()
  @Get('tags/:tagId/translations')
  getTagTranslations(@Param('tagId') tagId: string) {
    return this.resourcesService.getTagTranslations(tagId);
  }

  /**
   * Create or update a translation for a specific tag
   * Admin-only endpoint
   *
   * @param tagId - Tag UUID
   * @param locale - Target locale (e.g., "en", "fr")
   * @param dto - Translation data (name)
   * @returns Created or updated translation
   */
  @Put('admin/tags/:tagId/translations/:locale')
  @Roles('admin')
  upsertTagTranslation(
    @Param('tagId') tagId: string,
    @Param('locale') locale: string,
    @Body() dto: { name: string },
  ) {
    return this.resourcesService.upsertTagTranslation(tagId, locale, dto);
  }

  /**
   * Delete a translation for a specific tag
   * Admin-only endpoint
   * Cannot delete source locale translation
   *
   * @param tagId - Tag UUID
   * @param locale - Target locale to delete
   * @returns Success message
   */
  @Delete('admin/tags/:tagId/translations/:locale')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  deleteTagTranslation(
    @Param('tagId') tagId: string,
    @Param('locale') locale: string,
  ) {
    return this.resourcesService.deleteTagTranslation(tagId, locale);
  }
}
