import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetResourcesDto } from "./dto/get-resources.dto";

/**
 * Service chargé de la gestion et de la consultation des ressources.
 * Il encapsule l’ensemble de la logique métier liée aux recherches,
 * filtrages, récupération détaillée et catégorisation des ressources.
 *
 * Toutes les opérations reposent sur `PrismaService` pour l’accès
 * à la base de données.
 */
@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère la liste des ressources en tenant compte
   * des éventuels filtres fournis via `GetResourcesDto`.
   *
   * @param params - Paramètres de filtrage (texte libre, catégorie, etc.).
   * @returns Liste des ressources correspondant aux critères.
   */
  findAll(params: GetResourcesDto) {
    const { q, categorySlug } = params;

    return this.prisma.resource.findMany({
      where: {
        AND: [
          categorySlug
            ? { category: { slug: categorySlug } }
            : {},
          q
            ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                {
                  tags: {
                    some: {
                      tag: {
                        name: { contains: q, mode: "insensitive" },
                      },
                    },
                  },
                },
              ],
            }
            : {},
        ],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Recherche une ressource unique via son `slug`.
   * Déclenche une exception contrôlée si aucune ressource n’existe.
   *
   * @param slug - Identifiant textuel unique de la ressource.
   * @returns La ressource correspondante si elle est trouvée.
   *
   * @throws NotFoundException si aucune ressource ne correspond au slug.
   */
  async findOneBySlug(slug: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!resource) {
      throw new NotFoundException("Resource not found");
    }

    return resource;
  }

  /**
   * Récupère la liste des catégories de ressources,
   * accompagnée d’un comptage automatique des ressources liées.
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
