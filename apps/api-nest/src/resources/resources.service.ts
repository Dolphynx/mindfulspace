import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetResourcesDto } from "./dto/get-resources.dto";

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

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

  findCategories() {
    return this.prisma.resourceCategory.findMany({
      include: { _count: { select: { resources: true } } },
      orderBy: { name: "asc" },
    });
  }
}
