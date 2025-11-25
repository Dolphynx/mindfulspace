import {
  PrismaClient,
  ResourceType,
  MeditationSessionSource,
  MeditationMode
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------------------------------------------------------
  // CLEAN DATABASE (SAFE)
  // ---------------------------------------------------------------------------
  console.log("🔄 Clearing existing data (safe)...");

  // D'abord les sessions qui dépendent des users / types / contenus
  await prisma.exerciceSession.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.sleepSession.deleteMany();
  await prisma.meditationSession.deleteMany();

  // Programmes & contenus de méditation (si présents)
  await prisma.meditationProgramItem?.deleteMany().catch(() => {});
  await prisma.meditationProgram?.deleteMany().catch(() => {});
  await prisma.meditationVisualConfig?.deleteMany().catch(() => {});
  await prisma.meditationContent?.deleteMany().catch(() => {});
  await prisma.meditationType?.deleteMany().catch(() => {});

  // Types d'exercice
  await prisma.exerciceType.deleteMany();

  // Resources (full reset)
  await prisma.resourceTagOnResource?.deleteMany().catch(() => {});
  await prisma.resource.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.resourceCategory.deleteMany();

  console.log("✔ Database cleared.");

  // ---------------------------------------------------------------------------
  // Seed MeditationType
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding meditation types...");

  const meditationTypesData = [
    {
      slug: "breathing",
      //name: "Respiration consciente",
      //description: "Focalisation sur le souffle pour apaiser le système nerveux.",
      sortOrder: 10,
    },
    {
      slug: "mindfulness",
      //name: "Pleine conscience",
      //description: "Observer pensées, émotions et sensations sans jugement.",
      sortOrder: 20,
    },
    {
      slug: "body-scan",
      //name: "Body scan",
      //description: "Balayer le corps avec l'attention pour relâcher les tensions.",
      sortOrder: 30,
    },
    {
      slug: "compassion",
      //name: "Compassion / Metta",
      //description: "Cultiver la bienveillance envers soi et les autres.",
      sortOrder: 40,
    },
  ];

  const meditationTypes = [];

  for (const type of meditationTypesData) {
    const created = await prisma.meditationType.upsert({
      where: { slug: type.slug },
      update: {},
      create: {
        slug: type.slug,
        //name: type.name,
        //description: type.description,
        isActive: true,
        sortOrder: type.sortOrder,
      },
    });
    meditationTypes.push(created);
  }

  console.log(`✔ ${meditationTypes.length} meditation types seeded.`);

  const breathingType = meditationTypes[0]; // on utilisera celui-ci pour les seeds de sessions

  // ---------------------------------------------------------------------------
  // Seed MeditationContent
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding meditation contents...");

  const mindfulnessType = meditationTypes.find((t) => t.slug === "mindfulness");
  const bodyScanType = meditationTypes.find((t) => t.slug === "body-scan");
  const compassionType = meditationTypes.find((t) => t.slug === "compassion");

  if (!breathingType || !mindfulnessType || !bodyScanType || !compassionType) {
    throw new Error("Meditation types not properly seeded");
  }

  type MeditationContentSeed = {
    title: string;
    description: string;
    defaultMeditationTypeId: string;
    mode: MeditationMode;
    minDurationSeconds: number | null;
    maxDurationSeconds: number | null;
    defaultDurationSeconds: number | null;
    sortOrder: number;
    isPremium: boolean;
    mediaUrl?: string | null;
  };

  const meditationContentsData: MeditationContentSeed[] = [
    // ---------- BREATHING ----------
    {
      title: "Respiration 4-4-4 (timer)",
      description:
        "Inspirez, retenez et expirez en 4 temps pour apaiser le système nerveux.",
      defaultMeditationTypeId: breathingType.id,
      mode: MeditationMode.TIMER,
      minDurationSeconds: 300,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 300,
      sortOrder: 10,
      isPremium: false,
    },
    {
      title: "Respiration cohérente (audio 10 min)",
      description:
        "Respiration guidée à 6 respirations par minute pour recentrer l’esprit.",
      defaultMeditationTypeId: breathingType.id,
      mode: MeditationMode.AUDIO,
      minDurationSeconds: 600,
      maxDurationSeconds: 600,
      defaultDurationSeconds: 600,
      sortOrder: 20,
      isPremium: false,
      mediaUrl: "/audio/respi_751ko.mp3",
    },
    {
      title: "Respiration en vagues (visuelle)",
      description:
        "Suivez le mouvement d’une vague qui se déploie au rythme de votre souffle.",
      defaultMeditationTypeId: breathingType.id,
      mode: MeditationMode.VISUAL,
      minDurationSeconds: 300,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 600,
      sortOrder: 30,
      isPremium: true,
    },

    // ---------- MINDFULNESS ----------
    {
      title: "Pleine conscience 5 minutes (timer)",
      description:
        "Quelques minutes pour revenir aux sensations et à la respiration.",
      defaultMeditationTypeId: mindfulnessType.id,
      mode: MeditationMode.TIMER,
      minDurationSeconds: 300,
      maxDurationSeconds: 600,
      defaultDurationSeconds: 300,
      sortOrder: 10,
      isPremium: false,
    },
    {
      title: "Présence au quotidien (audio 10 min)",
      description:
        "Une méditation guidée pour vivre une situation du quotidien en pleine conscience.",
      defaultMeditationTypeId: mindfulnessType.id,
      mode: MeditationMode.AUDIO,
      minDurationSeconds: 600,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 600,
      sortOrder: 20,
      isPremium: false,
      mediaUrl: "/audio/respi_751ko.mp3",
    },
    {
      title: "Flamme de présence (visuelle)",
      description:
        "Fixez la flamme d’une bougie et revenez doucement à l’instant présent.",
      defaultMeditationTypeId: mindfulnessType.id,
      mode: MeditationMode.VISUAL,
      minDurationSeconds: 300,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 600,
      sortOrder: 30,
      isPremium: true,
    },

    // ---------- BODY SCAN ----------
    {
      title: "Body scan express (timer)",
      description:
        "Un balayage rapide du corps pour relâcher les tensions principales.",
      defaultMeditationTypeId: bodyScanType.id,
      mode: MeditationMode.TIMER,
      minDurationSeconds: 300,
      maxDurationSeconds: 600,
      defaultDurationSeconds: 300,
      sortOrder: 10,
      isPremium: false,
    },
    {
      title: "Body scan complet (audio 15 min)",
      description:
        "Méditation guidée qui explore chaque partie du corps avec bienveillance.",
      defaultMeditationTypeId: bodyScanType.id,
      mode: MeditationMode.AUDIO,
      minDurationSeconds: 900,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 900,
      sortOrder: 20,
      isPremium: false,
      mediaUrl: "/audio/respi_751ko.mp3",
    },
    {
      title: "Body scan avec silhouette (visuelle)",
      description:
        "Une silhouette s’illumine progressivement pour accompagner le relâchement.",
      defaultMeditationTypeId: bodyScanType.id,
      mode: MeditationMode.VISUAL,
      minDurationSeconds: 600,
      maxDurationSeconds: 1200,
      defaultDurationSeconds: 900,
      sortOrder: 30,
      isPremium: true,
    },

    // ---------- COMPASSION / METTA ----------
    {
      title: "Metta 5 minutes (timer)",
      description:
        "Quelques minutes pour envoyer des vœux de bienveillance à soi et aux autres.",
      defaultMeditationTypeId: compassionType.id,
      mode: MeditationMode.TIMER,
      minDurationSeconds: 300,
      maxDurationSeconds: 600,
      defaultDurationSeconds: 300,
      sortOrder: 10,
      isPremium: false,
    },
    {
      title: "Compassion guidée (audio 10 min)",
      description:
        "Une pratique audio pour ouvrir le cœur et relâcher la dureté envers soi.",
      defaultMeditationTypeId: compassionType.id,
      mode: MeditationMode.AUDIO,
      minDurationSeconds: 600,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 600,
      sortOrder: 20,
      isPremium: true,
      mediaUrl: "/audio/respi_751ko.mp3",
    },
    {
      title: "Cercle de bienveillance (visuelle)",
      description:
        "Visualisez un cercle de lumière qui s’élargit pour inclure d’autres personnes.",
      defaultMeditationTypeId: compassionType.id,
      mode: MeditationMode.VISUAL,
      minDurationSeconds: 300,
      maxDurationSeconds: 900,
      defaultDurationSeconds: 600,
      sortOrder: 30,
      isPremium: true,
    },
  ];

  const meditationContents = [];

  for (const content of meditationContentsData) {
    const created = await prisma.meditationContent.create({
      data: {
        title: content.title,
        description: content.description,
        defaultMeditationTypeId: content.defaultMeditationTypeId,
        mode: content.mode,
        minDurationSeconds: content.minDurationSeconds,
        maxDurationSeconds: content.maxDurationSeconds,
        defaultDurationSeconds: content.defaultDurationSeconds,
        sortOrder: content.sortOrder,
        isActive: true,
        isPremium: content.isPremium,
        mediaUrl: content.mediaUrl ?? null,
      },
    });
    meditationContents.push(created);
  }

  console.log(`✔ ${meditationContents.length} meditation contents seeded.`);



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
  // Workout Session Demo (optionnel, lié au user)
  // ---------------------------------------------------------------------------
  const workout = await prisma.workoutSession.create({
    data: {
      quality: 4,
      dateSession: new Date(),
      userId: demoUser.id,
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
  // SleepSession demo (liée au user)
  // ---------------------------------------------------------------------------
  await prisma.sleepSession.create({
    data: {
      hours: 7,
      quality: 4,
      dateSession: new Date(),
      userId: demoUser.id,
    },
  });

  console.log("✔ SleepSession seeded.");

  // ---------------------------------------------------------------------------
  // Meditation Sessions liées au user (nouveau modèle)
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding meditation sessions for demo user...");

  const meditationSeeds = [
    // Hier : 2 méditations
    { daysAgo: 1, durationMin: 12, quality: 4, hour: 7, minute: 30 },
    { daysAgo: 1, durationMin: 20, quality: 5, hour: 21, minute: 0 },

    // Il y a 2 jours : 1 méditation
    { daysAgo: 2, durationMin: 8, quality: 3, hour: 12, minute: 0 },

    // Il y a 3 jours : 3 méditations
    { daysAgo: 3, durationMin: 10, quality: 3, hour: 6, minute: 45 },
    { daysAgo: 3, durationMin: 15, quality: 4, hour: 13, minute: 15 },
    { daysAgo: 3, durationMin: 5, quality: 2, hour: 22, minute: 0 },

    // Jours suivants : 1 méditation
    { daysAgo: 4, durationMin: 5, quality: 3, hour: 12, minute: 0 },
    { daysAgo: 5, durationMin: 10, quality: 4, hour: 12, minute: 0 },
    { daysAgo: 6, durationMin: 7, quality: 2, hour: 12, minute: 0 },
    { daysAgo: 7, durationMin: 9, quality: 4, hour: 12, minute: 0 },
  ];

  for (const s of meditationSeeds) {
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - s.daysAgo);
    startedAt.setHours(s.hour ?? 12, s.minute ?? 0, 0, 0);

    const durationSeconds = s.durationMin * 60;
    const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    await prisma.meditationSession.create({
      data: {
        userId: demoUser.id,
        source: MeditationSessionSource.MANUAL,
        meditationTypeId: breathingType.id,
        meditationContentId: null, // ici ce sont des saisies "manuelles"
        startedAt,
        endedAt,
        durationSeconds,
        moodBefore: null,
        moodAfter: s.quality,
        notes: null,
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
    summary:
      "Une méthode en quatre étapes pour déconnecter doucement en fin de journée.",
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
