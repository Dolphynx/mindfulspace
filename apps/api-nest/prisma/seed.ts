import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------------------------------------------------------
  // CLEAN DATABASE (SAFE)
  // ---------------------------------------------------------------------------
  console.log("🔄 Clearing existing data (safe)...");

  // Delete sessions first (depend on user & types)
  await prisma.exerciceSession.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.sleepSession.deleteMany();
  await prisma.meditationSession.deleteMany();

  // Delete exercise types
  await prisma.exerciceType.deleteMany();

  // Delete resources (full reset)
  await prisma.resourceTagOnResource?.deleteMany().catch(() => {});
  await prisma.resource.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.resourceCategory.deleteMany();

  console.log("✔ Database cleared.");

  // ---------------------------------------------------------------------------
  // Seed Exercise Types
  // ---------------------------------------------------------------------------
  const exerciceTypes = [
    { name: "Push Ups", Description: "Upper-body bodyweight press" },
    { name: "Pull Ups", Description: "Back and biceps bodyweight pull" },
    { name: "Squats", Description: "Lower-body compound movement" },
    { name: "Plank", Description: "Core stabilization exercise" },
    { name: "Burpees", Description: "Full-body conditioning move" },
    { name: "Bench Press", Description: "Chest compound barbell lift" },
    { name: "Deadlift", Description: "Posterior chain barbell lift" },
    { name: "Overhead Press", Description: "Shoulder barbell press" },
  ];

  for (const type of exerciceTypes) {
    await prisma.exerciceType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log("✔ ExerciceType seeded");

  // ---------------------------------------------------------------------------
  // Workout Session Demo
  // ---------------------------------------------------------------------------
  const workout = await prisma.workoutSession.create({
    data: {
      quality: 4,
      dateSession: new Date(),
      exerciceSessions: {
        create: [
          {
            exerciceType: { connect: { name: "Push Ups" } },
            repetitionCount: 20,
          },
          {
            exerciceType: { connect: { name: "Squats" } },
            repetitionCount: 15,
          },
        ],
      },
    },
  });

  console.log("✔ WorkoutSession seeded:", workout.id);

  // ---------------------------------------------------------------------------
  // SleepSession demo
  // ---------------------------------------------------------------------------
  await prisma.sleepSession.create({
    data: {
      hours: 7,
      quality: 4,
      dateSession: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // USER DEMO
  // ---------------------------------------------------------------------------
  console.log("🌱 Creating demo user...");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@mindfulspace.app" },
    update: {},
    create: {
      email: "demo@mindfulspace.app",
      displayName: "Demo User",
    },
  });

  console.log("✔ Demo user ready:", demoUser.email);

  // ---------------------------------------------------------------------------
  // Meditation Sessions liées au user
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding meditation sessions for demo user...");

  const meditationSeeds = [
    // Hier : 2 méditations
    { daysAgo: 1, duration: 12, quality: 4, hour: 7, minute: 30 },
    { daysAgo: 1, duration: 20, quality: 5, hour: 21, minute: 0 },

    // Il y a 2 jours : 1 méditation
    { daysAgo: 2, duration: 8, quality: 3, hour: 12, minute: 0 },

    // Il y a 3 jours : 3 méditations
    { daysAgo: 3, duration: 10, quality: 3, hour: 6, minute: 45 },
    { daysAgo: 3, duration: 15, quality: 4, hour: 13, minute: 15 },
    { daysAgo: 3, duration: 5, quality: 2, hour: 22, minute: 0 },

    // Jours suivants : 1 méditation
    { daysAgo: 4, duration: 5, quality: 3, hour: 12, minute: 0 },
    { daysAgo: 5, duration: 10, quality: 4, hour: 12, minute: 0 },
    { daysAgo: 6, duration: 7, quality: 2, hour: 12, minute: 0 },
    { daysAgo: 7, duration: 9, quality: 4, hour: 12, minute: 0 },
  ];

  for (const s of meditationSeeds) {
    const d = new Date();
    d.setDate(d.getDate() - s.daysAgo);
    d.setHours(s.hour ?? 12, s.minute ?? 0, 0, 0);

    await prisma.meditationSession.create({
      data: {
        duration: s.duration,
        quality: s.quality,
        dateSession: d,
        userId: demoUser.id,
      },
    });
  }

  console.log(`✔ ${meditationSeeds.length} meditation sessions seeded.`);


  // ---------------------------------------------------------------------------
  // Resources (categories, tags, resources…)
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding resource categories, tags & resources...");

  const articleCat = await prisma.resourceCategory.create({
    data: { name: "Articles", slug: "articles", iconEmoji: "📄" },
  });

  const guideCat = await prisma.resourceCategory.create({
    data: { name: "Guides", slug: "guides", iconEmoji: "📘" },
  });

  const meditationTag = await prisma.resourceTag.create({
    data: { name: "Meditation", slug: "meditation" },
  });

  const mentalHealthTag = await prisma.resourceTag.create({
    data: { name: "Mental health", slug: "mental-health" },
  });

  const wellnessTag = await prisma.resourceTag.create({
    data: { name: "Wellness", slug: "wellness" },
  });

  // Article utilitaire
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
    prisma.resource.create({
      data: {
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
    });

  await createArticle({
    slug: "10-science-backed-benefits-of-meditation",
    title: "10 bienfaits de la méditation prouvés par la science",
    summary:
      "Un tour d’horizon des effets de la méditation sur le stress, le sommeil et la concentration.",
    content: "…",
    isFeatured: true,
    readTimeMin: 8,
    tags: ["meditation", "mental-health", "wellness"],
  });

  await createArticle({
    slug: "how-to-build-an-evening-routine",
    title: "Construire une routine du soir qui apaise le mental",
    summary: "Une méthode en quatre étapes pour déconnecter doucement en fin de journée.",
    content: "…",
    readTimeMin: 6,
    tags: ["wellness", "mental-health"],
  });

  await prisma.resource.create({
    data: {
      title: "Guide de démarrage MindfulSpace",
      slug: "mindfulspace-starter-guide",
      summary: "Comprendre en 5 minutes comment utiliser MindfulSpace...",
      content: "…",
      type: ResourceType.GUIDE,
      isFeatured: true,
      readTimeMin: 5,
      authorName: "Équipe MindfulSpace",
      categoryId: guideCat.id,
      tags: {
        create: [{ tag: { connect: { slug: "wellness" } } }],
      },
    },
  });

  console.log("✔ Resources seeded.");

  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding done.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
