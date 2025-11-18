import "dotenv/config";
import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding resources...");

  // --- catégories ---
  const articleCat = await prisma.resourceCategory.upsert({
    where: { slug: "articles" },
    update: {},
    create: {
      name: "Articles",
      slug: "articles",
      iconEmoji: "📄",
    },
  });

  const guideCat = await prisma.resourceCategory.upsert({
    where: { slug: "guides" },
    update: {},
    create: {
      name: "Guides",
      slug: "guides",
      iconEmoji: "📘",
    },
  });

  // --- tags ---
  const meditationTag = await prisma.resourceTag.upsert({
    where: { slug: "meditation" },
    update: {},
    create: { name: "Meditation", slug: "meditation" },
  });

  const mentalHealthTag = await prisma.resourceTag.upsert({
    where: { slug: "mental-health" },
    update: {},
    create: { name: "Mental health", slug: "mental-health" },
  });

  const wellnessTag = await prisma.resourceTag.upsert({
    where: { slug: "wellness" },
    update: {},
    create: { name: "Wellness", slug: "wellness" },
  });

  // petite fonction utilitaire pour ne pas se répéter
  const createArticle = (data: {
    slug: string;
    title: string;
    summary: string;
    content: string;
    isPremium?: boolean;
    isFeatured?: boolean;
    readTimeMin?: number;
    tags: string[];
  }) =>
    prisma.resource.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        type: ResourceType.ARTICLE,
        isPremium: data.isPremium ?? false,
        isFeatured: data.isFeatured ?? false,
        readTimeMin: data.readTimeMin ?? 5,
        authorName: "Dr. Sarah Johnson",
        categoryId: articleCat.id,
        tags: {
          create: data.tags.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

  await createArticle({
    slug: "10-science-backed-benefits-of-meditation",
    title: "10 bienfaits de la méditation prouvés par la science",
    summary:
      "Un tour d’horizon des effets de la méditation sur le stress, le sommeil et la concentration.",
    content:
      "De nombreuses études montrent que quelques minutes de méditation quotidienne peuvent réduire le niveau de cortisol, améliorer la qualité du sommeil et renforcer la capacité d’attention. Dans cet article, nous passons en revue dix conclusions clés et des pistes très concrètes pour démarrer sans pression…",
    isFeatured: true,
    readTimeMin: 8,
    tags: ["meditation", "mental-health", "wellness"],
  });

  await createArticle({
    slug: "how-to-build-an-evening-routine",
    title: "Construire une routine du soir qui apaise le mental",
    summary:
      "Une méthode en quatre étapes pour déconnecter doucement en fin de journée.",
    content:
      "Il est difficile de s’endormir quand la journée ne s’est jamais vraiment arrêtée. En structurant une routine du soir simple – arrêt des écrans, rituel de gratitude, respiration calme – on aide le cerveau à passer en mode repos. Voici comment la mettre en place en moins de 20 minutes…",
    readTimeMin: 6,
    tags: ["wellness", "mental-health"],
  });

  await prisma.resource.upsert({
    where: { slug: "mindfulspace-starter-guide" },
    update: {},
    create: {
      title: "Guide de démarrage MindfulSpace",
      slug: "mindfulspace-starter-guide",
      summary:
        "Comprendre en 5 minutes comment utiliser MindfulSpace pour suivre votre bien-être.",
      content:
        "Dans ce guide, nous expliquons comment enregistrer vos séances, lire les statistiques principales du tableau de bord et accéder aux resources essentielles. C’est le point de départ recommandé pour les nouveaux utilisateurs.",
      type: ResourceType.GUIDE,
      isPremium: false,
      isFeatured: true,
      readTimeMin: 5,
      authorName: "Équipe MindfulSpace",
      categoryId: guideCat.id,
      tags: {
        create: [
          { tag: { connect: { slug: "wellness" } } },
        ],
      },
    },
  });

  console.log("✅ Resources seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
