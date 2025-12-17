import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { CreateResourceDto } from "./dto/create-resource.dto";
import { UpdateResourceDto } from "./dto/update-resource.dto";
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
  constructor(private readonly prisma: PrismaService) {}

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
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            summary: {
              contains: query,
              mode: "insensitive",
            },
          },
          // Adapté au schéma classique Resource -> ResourceTag -> Tag
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: query,
                    mode: "insensitive",
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
      include: { _count: { select: { resources: true } } },
      orderBy: { name: "asc" },
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
   * Create a new resource
   *
   * @param authorId - User ID from JWT (creator of the resource)
   * @param dto - Resource data
   * @returns Created resource
   * @throws BadRequestException if category doesn't exist or slug is duplicate
   */
  async create(authorId: string, dto: CreateResourceDto) {
    // Validate that category exists
    const category = await this.prisma.resourceCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID "${dto.categoryId}" does not exist`);
    }

    // Validate that all tags exist (if provided)
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.prisma.resourceTag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
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

    // Create resource with tag connections
    const { tagIds, ...resourceData } = dto;

    return this.prisma.resource.create({
      data: {
        ...resourceData,
        authorId,
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
    const { tagIds, ...resourceData } = dto;

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
      orderBy: { name: 'asc' },
    });
  }
}
