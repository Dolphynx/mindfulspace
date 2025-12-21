import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
import { AutoTranslateDto } from "./dto/auto-translate.dto";
import { CreateTranslationDto } from "./dto/create-translation.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { Prisma } from "@prisma/client";
import { CurrentUserType } from "../auth/types/current-user.type";

/**
 * Service chargé de la gestion et de la consultation des ressources.
 *
 * @remarks
 * Cette couche encapsule l’ensemble de la logique métier liée :
 *
 * - à la recherche et au filtrage de ressources (texte libre, catégorie, …) ;
 * - à la récupération détaillée d’une ressource via son slug ;
 * - à la récupération et au comptage des catégories de ressources.
 *
 * Toute l’implémentation repose sur {@link PrismaService} pour l’accès
 * à la base de données.
 *
 * @remarks Swagger
 * Dans le contrôleur, ce service est typiquement utilisé par les endpoints :
 * - `GET /resources`
 * - `GET /resources/categories`
 * - `GET /resources/:slug`
 * - `GET /resources/:slug` (version sécurisée premium via `findOneBySlugForUser`)
 */
@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Récupère la liste des ressources en appliquant les filtres éventuels.
   *
   * @remarks
   * Les critères de filtrage sont fournis via {@link GetResourcesDto} :
   *
   * - `q` : recherche plein texte approximative sur le titre, le résumé
   *   ou les tags associés à la ressource (via une clause `contains`) ;
   * - `categorySlug` : restreint les ressources à une catégorie donnée.
   *
   * Le résultat inclut la catégorie et les tags afin de permettre un
   * affichage riche côté frontend.
   *
   * @param dto Paramètres de recherche et de filtrage.
   * @returns La liste des ressources correspondant aux critères.
   *
   * @example
   * ```ts
   * // Liste toutes les ressources de la catégorie "wellness"
   * resourcesService.findAll({ categorySlug: 'wellness' });
   *
   * // Recherche plein texte sur "sommeil"
   * resourcesService.findAll({ q: 'sommeil' });
   * ```
   */
  async findAll(dto: GetResourcesDto) {
    const { q, categorySlug } = dto;

    const where: Prisma.ResourceWhereInput = {};

    // Filtre par catégorie (via le slug de la catégorie associée)
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // Filtre de recherche libre
    if (q) {
      const query = q.trim();

      if (query.length > 0) {
        where.OR = [
          {
            translations: {
              some: {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            translations: {
              some: {
                summary: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
          // Search in tag translations
          {
            tags: {
              some: {
                tag: {
                  translations: {
                    some: {
                      name: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
          },
        ];
      }
    }

    return this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        translations: true, // Include translations for multi-language support
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Récupère les détails d’une ressource à partir de son slug.
   *
   * @remarks
   * La ressource renvoyée inclut généralement :
   * - sa catégorie (`category`) ;
   * - ses tags (`tags`) ;
   * - les méta-informations utiles à l’affichage (liens, auteur, etc.).
   *
   * Cette méthode ne tient PAS compte des règles d’accès premium.
   * Elle est surtout utile en interne ou dans des contextes déjà sécurisés.
   *
   * @param slug Slug unique de la ressource dans la base de données.
   * @returns La ressource trouvée.
   *
   * @throws NotFoundException si aucune ressource ne correspond à ce slug.
   */
  async findOneBySlug(slug: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { slug },
      include: {
        category: true,
        translations: true, // Include translations for multi-language support
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException(
        `Resource with slug "${slug}" was not found`,
      );
    }

    return resource;
  }

  /**
   * Récupère la liste des catégories de ressources,
   * accompagnée d’un comptage automatique des ressources liées.
   *
   * @remarks
   * Le comptage est effectué via `_count.resources` fourni par Prisma.
   * Les catégories sont triées alphabétiquement sur `name`.
   *
   * @returns Liste typée des catégories triées alphabétiquement.
   *
   * @example
   * ```ts
   * const categories = await resourcesService.findCategories();
   * // categories[0]._count.resources => nombre de ressources dans la catégorie
   * ```
   */
  findCategories() {
    return this.prisma.resourceCategory.findMany({
      include: {
        translations: true,
        _count: { select: { resources: true } },
      },
      orderBy: { slug: "asc" },
    });
  }

  /**
   * Récupère les détails d’une ressource en appliquant les règles
   * d’accès liées au statut premium.
   *
   * @remarks
   * - Si la ressource n’existe pas → `NotFoundException`.
   * - Si la ressource est premium et que l’utilisateur n’a pas le rôle
   *   `premium` ou `admin` → `ForbiddenException`.
   * - Sinon, la ressource est renvoyée normalement.
   *
   * Cette méthode est typiquement appelée par un endpoint public
   * (`@Public()` dans le contrôleur) qui accepte un utilisateur optionnel.
   *
   * @param slug Slug unique de la ressource dans la base de données.
   * @param user Utilisateur courant (optionnel), contenant ses rôles.
   * @returns La ressource si elle est accessible pour l’utilisateur.
   *
   * @throws NotFoundException si aucune ressource ne correspond au slug.
   * @throws ForbiddenException si la ressource est premium et que l’utilisateur
   *         n’a pas les droits nécessaires.
   *
   * @example
   * ```ts
   * // Appel avec un utilisateur premium
   * resourcesService.findOneBySlugForUser('routine-soir', {
   *   id: 'user-123',
   *   roles: ['premium'],
   * });
   *
   * // Appel sans utilisateur (visiteur non connecté)
   * // → ForbiddenException si la ressource est premium
   * resourcesService.findOneBySlugForUser('routine-soir');
   * ```
   */
  async findOneBySlugForUser(
    slug: string,
    user?: CurrentUserType,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { slug },
      include: {
        category: true,
        translations: true, // Include translations for multi-language support
        tags: { include: { tag: true } },
      },
    });

    if (!resource) {
      throw new NotFoundException(
        `Resource with slug "${slug}" was not found`,
      );
    }

    // Protection premium : seuls les rôles "premium", "coach" ou "admin"
    // sont autorisés à consulter une ressource premium.
    if (resource.isPremium) {
      const roles: string[] = user?.roles ?? [];

      const hasAccess: boolean =
        roles.includes("premium") ||
        roles.includes("coach") ||
        roles.includes("admin");

      if (!hasAccess) {
        throw new ForbiddenException("Premium resource");
      }
    }

    return resource;
  }

  /**
   * Create a new resource with translation support
   *
   * @param authorId - User ID from JWT (creator of the resource)
   * @param dto - Resource data (including title, summary, content in source language)
   * @returns Created resource with initial translation
   * @throws BadRequestException if category doesn't exist or validation fails
   */
  async create(authorId: string, dto: CreateResourceDto) {
    const { title, summary, content, tagIds, sourceLocale = 'fr', ...resourceData } = dto;

    // Validate that category exists
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID "${dto.categoryId}" does not exist`);
    }

    // Validate that all tags exist (if provided)
    if (tagIds && tagIds.length > 0) {
      const tags = await this.prisma.resourceTag.findMany({
        where: { id: { in: tagIds } },
      });

      if (tags.length !== tagIds.length) {
        throw new BadRequestException('One or more tag IDs are invalid');
      }
    }

    // Validate meditation program exists (if provided)
    if (dto.meditationProgramId) {
      const program = await this.prisma.meditationProgram.findUnique({
        where: { id: dto.meditationProgramId },
      });

      if (!program) {
        throw new BadRequestException(`Meditation program with ID "${dto.meditationProgramId}" does not exist`);
      }
    }

    // Generate slug from title (English)
    // If source is not English, we'll use the title as-is for now
    // TODO: In Phase 3, translate to English first if source is not English
    const slug = await this.generateUniqueSlug(title);

    // Create resource with source translation
    return this.prisma.resource.create({
      data: {
        ...resourceData,
        slug,
        sourceLocale,
        authorId,
        translations: {
          create: {
            locale: sourceLocale,
            title,
            summary,
            content,
          },
        },
        tags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        translations: true,
        tags: {
          include: { tag: true },
        },
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Generate a unique URL-friendly slug from a title
   *
   * @param title - The title to slugify
   * @param excludeResourceId - Optional resource ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  private async generateUniqueSlug(title: string, excludeResourceId?: string): Promise<string> {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.resource.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === excludeResourceId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Convert a string to a URL-friendly slug
   *
   * @param text - The text to slugify
   * @returns URL-friendly slug (lowercase, hyphens, no special chars)
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
      .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '')             // Trim hyphens from start
      .replace(/-+$/, '');            // Trim hyphens from end
  }

  /**
   * Update an existing resource
   *
   * @param resourceId - Resource UUID
   * @param userId - Current user ID (from JWT)
   * @param userRoles - Current user roles (from JWT)
   * @param dto - Updated resource data
   * @returns Updated resource
   * @throws NotFoundException if resource doesn't exist
   * @throws ForbiddenException if user doesn't have permission to edit
   */
  async update(
    resourceId: string,
    userId: string,
    userRoles: string[],
    dto: UpdateResourceDto,
  ) {
    // Fetch existing resource
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
    }

    // Authorization check: owner or admin
    const isOwner = resource.authorId === userId;
    const isAdmin = userRoles.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to edit this resource');
    }

    // Only admins can set isFeatured
    if (dto.isFeatured !== undefined && !isAdmin) {
      throw new ForbiddenException('Only admins can feature resources');
    }

    // Validate category exists (if being updated)
    if (dto.categoryId) {
      const category = await this.prisma.resourceCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(`Category with ID "${dto.categoryId}" does not exist`);
      }
    }

    // Validate tags exist (if being updated)
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.prisma.resourceTag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('One or more tag IDs are invalid');
      }
    }

    // Validate meditation program exists (if being updated)
    if (dto.meditationProgramId) {
      const program = await this.prisma.meditationProgram.findUnique({
        where: { id: dto.meditationProgramId },
      });

      if (!program) {
        throw new BadRequestException(`Meditation program with ID "${dto.meditationProgramId}" does not exist`);
      }
    }

    // Handle tag updates (replace existing tags)
    // Filter out title, summary, content - they're in ResourceTranslation now
    const { tagIds, title, summary, content, ...resourceData } = dto;

    return this.prisma.resource.update({
      where: { id: resourceId },
      data: {
        ...resourceData,
        tags: tagIds
          ? {
              // Delete existing tags and create new ones
              deleteMany: {},
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        translations: true,
        tags: {
          include: { tag: true },
        },
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Delete a resource
   *
   * @param resourceId - Resource UUID
   * @param userId - Current user ID (from JWT)
   * @param userRoles - Current user roles (from JWT)
   * @throws NotFoundException if resource doesn't exist
   * @throws ForbiddenException if user doesn't have permission to delete
   */
  async delete(resourceId: string, userId: string, userRoles: string[]) {
    // Fetch existing resource
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
    }

    // Authorization check: owner or admin
    const isOwner = resource.authorId === userId;
    const isAdmin = userRoles.includes('admin');
    const isCoach = userRoles.includes('coach');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this resource');
    }

    // Coaches cannot delete resources linked to meditation programs (only admins can)
    if (isCoach && !isAdmin && resource.meditationProgramId) {
      throw new ForbiddenException(
        'Cannot delete resources linked to meditation programs. Contact an admin.',
      );
    }

    // Delete resource (tags will be cascade deleted automatically via database constraint)
    await this.prisma.resource.delete({
      where: { id: resourceId },
    });
  }

  /**
   * Get all resources created by a specific author
   * Used for coach dashboard to show "my resources"
   *
   * @param authorId - Author user ID
   * @returns List of resources by this author
   */
  async findByAuthor(authorId: string) {
    return this.prisma.resource.findMany({
      where: { authorId },
      include: {
        category: true,
        translations: true,
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all tags (for form dropdowns)
   *
   * @returns List of all resource tags
   */
  async findAllTags() {
    return this.prisma.resourceTag.findMany({
      include: {
        translations: true,
      },
      orderBy: { slug: 'asc' },
    });
  }

  /**
   * Get all translations for a specific resource
   *
   * @param resourceId - Resource UUID
   * @returns List of all translations for this resource
   */
  async getTranslations(resourceId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
    }

    return this.prisma.resourceTranslation.findMany({
      where: { resourceId },
      orderBy: { locale: 'asc' },
    });
  }

  /**
   * Create or update a translation for a specific resource
   *
   * @param resourceId - Resource UUID
   * @param locale - Target locale (e.g., "en", "fr")
   * @param dto - Translation data
   * @returns Created or updated translation
   */
  async upsertTranslation(
    resourceId: string,
    locale: string,
    dto: CreateTranslationDto,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
    }

    return this.prisma.resourceTranslation.upsert({
      where: {
        resourceId_locale: {
          resourceId,
          locale,
        },
      },
      create: {
        resourceId,
        locale,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
      },
      update: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
      },
    });
  }

  /**
   * Auto-translate a resource to multiple target locales using AI
   *
   * @param resourceId - Resource UUID
   * @param dto - Contains array of target locales
   * @returns Array of created/updated translations
   */
  async autoTranslate(resourceId: string, dto: AutoTranslateDto) {
    // Get resource
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
    }

    // Get source translation (should always exist)
    const sourceTranslation = await this.prisma.resourceTranslation.findUnique({
      where: {
        resourceId_locale: {
          resourceId,
          locale: resource.sourceLocale,
        },
      },
    });

    if (!sourceTranslation) {
      throw new BadRequestException(
        `Source translation not found for resource "${resourceId}". Source locale: ${resource.sourceLocale}`,
      );
    }

    // Filter out source locale from target locales (no need to translate to itself)
    const targetLocales = dto.targetLocales.filter(
      (locale) => locale !== resource.sourceLocale,
    );

    if (targetLocales.length === 0) {
      throw new BadRequestException(
        'No valid target locales provided (source locale excluded)',
      );
    }

    // Translate to each target locale
    const translations = await Promise.all(
      targetLocales.map(async (targetLocale) => {
        // Translate title, summary, and content
        const [translatedTitle, translatedSummary, translatedContent] = await Promise.all([
          this.aiService.translateText(
            sourceTranslation.title,
            resource.sourceLocale,
            targetLocale,
          ),
          this.aiService.translateText(
            sourceTranslation.summary,
            resource.sourceLocale,
            targetLocale,
          ),
          this.aiService.translateText(
            sourceTranslation.content,
            resource.sourceLocale,
            targetLocale,
          ),
        ]);

        // Upsert translation (create if doesn't exist, update if exists)
        return this.prisma.resourceTranslation.upsert({
          where: {
            resourceId_locale: {
              resourceId,
              locale: targetLocale,
            },
          },
          create: {
            resourceId,
            locale: targetLocale,
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedContent,
          },
          update: {
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedContent,
          },
        });
      }),
    );

    return translations;
  }

  // ========================================
  // CATEGORY MANAGEMENT (ADMIN ONLY)
  // ========================================

  /**
   * Create a new resource category
   * Admin-only operation
   */
  async createCategory(dto: CreateCategoryDto) {
    const { name, sourceLocale = 'fr', ...categoryData } = dto;

    // Check if slug already exists
    const existing = await this.prisma.resourceCategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    }

    // Create category with source translation
    return this.prisma.resourceCategory.create({
      data: {
        ...categoryData,
        sourceLocale,
        translations: {
          create: {
            locale: sourceLocale,
            name,
          },
        },
      },
      include: {
        translations: true,
        _count: {
          select: { resources: true },
        },
      },
    });
  }

  /**
   * Update an existing resource category
   * Admin-only operation
   * Note: If 'name' is provided, it updates the source locale translation automatically
   */
  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    // Check if category exists
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found`);
    }

    // If slug is being updated, check for conflicts
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.resourceCategory.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
      }
    }

    // Separate name from other fields (name goes to translation table)
    const { name, ...categoryData } = dto;

    // Update category and source locale translation
    return this.prisma.resourceCategory.update({
      where: { id: categoryId },
      data: {
        ...categoryData,
        // If name is provided, update the source locale translation
        ...(name && {
          translations: {
            upsert: {
              where: {
                categoryId_locale: {
                  categoryId,
                  locale: category.sourceLocale,
                },
              },
              update: {
                name,
              },
              create: {
                locale: category.sourceLocale,
                name,
              },
            },
          },
        }),
      },
      include: {
        translations: true,
        _count: {
          select: { resources: true },
        },
      },
    });
  }

  /**
   * Delete a resource category
   * Admin-only operation
   * Cannot delete if resources are still using this category
   */
  async deleteCategory(categoryId: string) {
    // Check if category exists
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found`);
    }

    // Prevent deletion if resources are using this category
    if (category._count.resources > 0) {
      throw new BadRequestException(
        `Cannot delete category because ${category._count.resources} resource(s) are still using it. Please reassign or delete those resources first.`,
      );
    }

    await this.prisma.resourceCategory.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }

  // ========================================
  // TAG MANAGEMENT (ADMIN ONLY)
  // ========================================

  /**
   * Create a new resource tag
   * Admin-only operation
   */
  async createTag(dto: CreateTagDto) {
    const { name, sourceLocale = 'fr', ...tagData } = dto;

    // Check if slug already exists
    const existing = await this.prisma.resourceTag.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Tag with slug '${dto.slug}' already exists`);
    }

    // Create tag with source translation
    return this.prisma.resourceTag.create({
      data: {
        ...tagData,
        sourceLocale,
        translations: {
          create: {
            locale: sourceLocale,
            name,
          },
        },
      },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Update an existing resource tag
   * Admin-only operation
   * Note: If 'name' is provided, it updates the source locale translation automatically
   */
  async updateTag(tagId: string, dto: UpdateTagDto) {
    // Check if tag exists
    const tag = await this.prisma.resourceTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID '${tagId}' not found`);
    }

    // If slug is being updated, check for conflicts
    if (dto.slug && dto.slug !== tag.slug) {
      const existing = await this.prisma.resourceTag.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException(`Tag with slug '${dto.slug}' already exists`);
      }
    }

    // Separate name from other fields (name goes to translation table)
    const { name, ...tagData } = dto;

    // Update tag and source locale translation
    return this.prisma.resourceTag.update({
      where: { id: tagId },
      data: {
        ...tagData,
        // If name is provided, update the source locale translation
        ...(name && {
          translations: {
            upsert: {
              where: {
                tagId_locale: {
                  tagId,
                  locale: tag.sourceLocale,
                },
              },
              update: {
                name,
              },
              create: {
                locale: tag.sourceLocale,
                name,
              },
            },
          },
        }),
      },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Delete a resource tag
   * Admin-only operation
   * Can delete even if resources are using this tag (tags are optional)
   */
  async deleteTag(tagId: string) {
    // Check if tag exists
    const tag = await this.prisma.resourceTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID '${tagId}' not found`);
    }

    // Delete tag (cascade will remove ResourceTagOnResource entries)
    await this.prisma.resourceTag.delete({
      where: { id: tagId },
    });

    return { message: 'Tag deleted successfully' };
  }

  // ========================================
  // CATEGORY TRANSLATION MANAGEMENT (ADMIN ONLY)
  // ========================================

  /**
   * Get all translations for a category
   * Admin-only operation
   */
  async getCategoryTranslations(categoryId: string) {
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    return this.prisma.resourceCategoryTranslation.findMany({
      where: { categoryId },
      orderBy: { locale: 'asc' },
    });
  }

  /**
   * Create or update a translation for a specific category
   * Admin-only operation
   */
  async upsertCategoryTranslation(
    categoryId: string,
    locale: string,
    dto: { name: string },
  ) {
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    return this.prisma.resourceCategoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
      create: {
        categoryId,
        locale,
        name: dto.name,
      },
      update: {
        name: dto.name,
      },
    });
  }

  /**
   * Delete a translation for a specific category
   * Admin-only operation
   */
  async deleteCategoryTranslation(categoryId: string, locale: string) {
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    // Cannot delete source locale translation
    if (locale === category.sourceLocale) {
      throw new BadRequestException(
        `Cannot delete source locale translation. Source locale is "${category.sourceLocale}".`,
      );
    }

    const translation = await this.prisma.resourceCategoryTranslation.findUnique({
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
    });

    if (!translation) {
      throw new NotFoundException(
        `Translation for category "${categoryId}" in locale "${locale}" not found`,
      );
    }

    await this.prisma.resourceCategoryTranslation.delete({
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
    });

    return { message: 'Category translation deleted successfully' };
  }

  // ========================================
  // TAG TRANSLATION MANAGEMENT (ADMIN ONLY)
  // ========================================

  /**
   * Get all translations for a tag
   * Admin-only operation
   */
  async getTagTranslations(tagId: string) {
    const tag = await this.prisma.resourceTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${tagId}" not found`);
    }

    return this.prisma.resourceTagTranslation.findMany({
      where: { tagId },
      orderBy: { locale: 'asc' },
    });
  }

  /**
   * Create or update a translation for a specific tag
   * Admin-only operation
   */
  async upsertTagTranslation(
    tagId: string,
    locale: string,
    dto: { name: string },
  ) {
    const tag = await this.prisma.resourceTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${tagId}" not found`);
    }

    return this.prisma.resourceTagTranslation.upsert({
      where: {
        tagId_locale: {
          tagId,
          locale,
        },
      },
      create: {
        tagId,
        locale,
        name: dto.name,
      },
      update: {
        name: dto.name,
      },
    });
  }

  /**
   * Delete a translation for a specific tag
   * Admin-only operation
   */
  async deleteTagTranslation(tagId: string, locale: string) {
    const tag = await this.prisma.resourceTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${tagId}" not found`);
    }

    // Cannot delete source locale translation
    if (locale === tag.sourceLocale) {
      throw new BadRequestException(
        `Cannot delete source locale translation. Source locale is "${tag.sourceLocale}".`,
      );
    }

    const translation = await this.prisma.resourceTagTranslation.findUnique({
      where: {
        tagId_locale: {
          tagId,
          locale,
        },
      },
    });

    if (!translation) {
      throw new NotFoundException(
        `Translation for tag "${tagId}" in locale "${locale}" not found`,
      );
    }

    await this.prisma.resourceTagTranslation.delete({
      where: {
        tagId_locale: {
          tagId,
          locale,
        },
      },
    });

    return { message: 'Tag translation deleted successfully' };
  }
}
