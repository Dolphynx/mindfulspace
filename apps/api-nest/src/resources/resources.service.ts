import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetResourcesDto } from "./dto/get-resources.dto";
import { Prisma } from "@prisma/client";

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
 * Toutes les opérations reposent sur {@link PrismaService} pour l’accès
 * à la base de données.
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
   */
  findCategories() {
    return this.prisma.resourceCategory.findMany({
      include: { _count: { select: { resources: true } } },
      orderBy: { name: "asc" },
    });
  }
}
