// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Clearing existing data...");

  // On nettoie dans un ordre safe vis-à-vis des FKs
  // 1. Données qui dépendent des types / unités / user
  await prisma.session.deleteMany();
  await prisma.objective.deleteMany();

  // 2. Données de démo pour le graphe d'accueil
  await prisma.testData.deleteMany();

  // 3. Jointures puis types / unités
  await prisma.sessionTypeUnit.deleteMany();
  await prisma.sessionType.deleteMany();
  await prisma.sessionUnit.deleteMany();

  // ⚠️ On NE TOUCHE PAS aux users existants ni aux resources ici.
  // Les resources sont upsert plus bas → pas de doublons.

  // ---------------------------------------------------------------------------
  // 1️⃣ TestData – données de démo pour le graphe de la home
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding TestData...");
  const demoData = [
    { metricName: "daily_meditation_minutes", label: "Lun", metricValue: 12 },
    { metricName: "daily_meditation_minutes", label: "Mar", metricValue: 9 },
    { metricName: "daily_meditation_minutes", label: "Mer", metricValue: 15 },
    { metricName: "daily_meditation_minutes", label: "Jeu", metricValue: 7 },
    { metricName: "daily_meditation_minutes", label: "Ven", metricValue: 14 },
    { metricName: "daily_meditation_minutes", label: "Sam", metricValue: 5 },
    { metricName: "daily_meditation_minutes", label: "Dim", metricValue: 11 },
  ];

  await prisma.testData.createMany({ data: demoData });

  // ---------------------------------------------------------------------------
  // 2️⃣ Units + SessionTypes + mapping des unités par priorité
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding SessionUnits...");
  const hoursUnit = await prisma.sessionUnit.create({
    data: { value: "Hours" },
  });

  const minutesUnit = await prisma.sessionUnit.create({
    data: { value: "Minutes" },
  });

  console.log("🌱 Seeding SessionTypes...");
  const sleepType = await prisma.sessionType.create({
    data: { name: "Sleep" },
  });
  const exerciseType = await prisma.sessionType.create({
    data: { name: "Exercise" },
  });
  const meditationType = await prisma.sessionType.create({
    data: { name: "Meditation" },
  });

  console.log("🌱 Linking SessionTypes ↔ SessionUnits with priority...");

  // Sleep: priority 1 = Hours, priority 2 = Minutes
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: sleepType.id,
      sessionUnitId: hoursUnit.id,
      priority: 1,
    },
  });
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: sleepType.id,
      sessionUnitId: minutesUnit.id,
      priority: 2,
    },
  });

  // Exercise: priority 1 = Minutes, priority 2 = Hours
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: exerciseType.id,
      sessionUnitId: minutesUnit.id,
      priority: 1,
    },
  });
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: exerciseType.id,
      sessionUnitId: hoursUnit.id,
      priority: 2,
    },
  });

  // Meditation: priority 1 = Minutes, priority 2 = Hours
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: meditationType.id,
      sessionUnitId: minutesUnit.id,
      priority: 1,
    },
  });
  await prisma.sessionTypeUnit.create({
    data: {
      sessionTypeId: meditationType.id,
      sessionUnitId: hoursUnit.id,
      priority: 2,
    },
  });

  console.log("✅ Created session types with ordered units:");
  console.table([
    { name: "Sleep", units: "Hours(1), Minutes(2)" },
    { name: "Exercise", units: "Minutes(1), Hours(2)" },
    { name: "Meditation", units: "Minutes(1), Hours(2)" },
  ]);

  // ---------------------------------------------------------------------------
  // 3️⃣ User de démo
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

  // ---------------------------------------------------------------------------
  // 4️⃣ POC Objectives + sessions de démo pour ce user
  //    (fusion de prisma/seed-objectives-poc.ts)
  // ---------------------------------------------------------------------------
  console.log("🌱 POC Objectives – démarrage...");

  // On récupère les unités prioritaires configurées juste au-dessus
  const sleepPrimaryTypeUnit = await prisma.sessionTypeUnit.findFirst({
    where: { sessionTypeId: sleepType.id },
    orderBy: { priority: "asc" },
    include: { sessionUnit: true },
  });

  const meditationPrimaryTypeUnit = await prisma.sessionTypeUnit.findFirst({
    where: { sessionTypeId: meditationType.id },
    orderBy: { priority: "asc" },
    include: { sessionUnit: true },
  });

  const exercisePrimaryTypeUnit = await prisma.sessionTypeUnit.findFirst({
    where: { sessionTypeId: exerciseType.id },
    orderBy: { priority: "asc" },
    include: { sessionUnit: true },
  });

  if (!sleepPrimaryTypeUnit || !meditationPrimaryTypeUnit || !exercisePrimaryTypeUnit) {
    console.error("❌ Impossible de trouver les SessionTypeUnit prioritaires");
    process.exit(1);
  }

  console.log("✅ Unités prioritaires trouvées :", {
    sleepUnit: sleepPrimaryTypeUnit.sessionUnit?.value,
    meditationUnit: meditationPrimaryTypeUnit.sessionUnit?.value,
    exerciseUnit: exercisePrimaryTypeUnit.sessionUnit?.value,
  });

  // On nettoie les anciennes sessions pour CE user (sans toucher aux autres)
  console.log("🔄 Suppression des sessions existantes du demoUser...");
  await prisma.session.deleteMany({
    where: { userId: demoUser.id },
  });

  console.log("🌱 Création de sessions de démo (14 derniers jours)...");
  const today = new Date();
  const daysBack = 14;

  const sessionsData: {
    value: number;
    quality: number | null;
    dateSession: Date;
    sessionTypeId: string;
    userId: string | null;
  }[] = [];

  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(12, 0, 0, 0);

    // Sommeil : 6–9 heures
    const sleepHours = 6 + Math.floor(Math.random() * 4);
    sessionsData.push({
      value: sleepHours,
      quality: null,
      dateSession: new Date(d),
      sessionTypeId: sleepType.id,
      userId: demoUser.id,
    });

    // Méditation : progression 5 → 5 + i minutes
    const meditationMinutes = 5 + i;
    sessionsData.push({
      value: meditationMinutes,
      quality: null,
      dateSession: new Date(d),
      sessionTypeId: meditationType.id,
      userId: demoUser.id,
    });

    // Exercice : 10–90 minutes
    const exerciseMinutes = 10 + Math.floor(Math.random() * 81);
    sessionsData.push({
      value: exerciseMinutes,
      quality: null,
      dateSession: new Date(d),
      sessionTypeId: exerciseType.id,
      userId: demoUser.id,
    });
  }

  await prisma.session.createMany({
    data: sessionsData,
  });

  console.log(`✅ ${sessionsData.length} sessions créées pour le demoUser`);

  console.log("🔄 Suppression des anciens objectifs du demoUser...");
  await prisma.objective.deleteMany({
    where: { userId: demoUser.id },
  });

  console.log("🌱 Création d’un objectif de sommeil (8h/jour pendant 7 jours)...");
  await prisma.objective.create({
    data: {
      userId: demoUser.id,
      sessionTypeId: sleepType.id,
      value: 8, // 8 heures de sommeil
      frequency: "DAILY", // ObjectiveFrequency
      durationUnit: "DAY", // ObjectiveDurationUnit
      durationValue: 7, // pendant 7 jours
      // On stocke l’unité prioritaire de Sleep (heures normalement)
      sessionUnitId: sleepPrimaryTypeUnit.sessionUnitId ?? null,
      // startsAt: laissé par défaut (now) si tu as un default(now())
    },
  });

  console.log("✅ Objectif créé pour le demoUser");

  // ---------------------------------------------------------------------------
  // 5️⃣ Resources (fusion de prisma/seed-resources.ts)
  // ---------------------------------------------------------------------------
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

  // Petite fonction utilitaire pour éviter les répétitions
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
      "De nombreuses études montrent que quelques minutes de méditation par jour peuvent réduire le stress, améliorer le sommeil et renforcer l’attention. Dans cet article, nous passons en revue dix conclusions clés et des pistes très concrètes pour démarrer sans pression.",
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
      "Il est difficile de s’endormir quand la journée ne s’est jamais vraiment arrêtée. Cette routine du soir, simple et réaliste, aide à poser des limites douces entre travail, écrans et repos. Voici comment la mettre en place en moins de 20 minutes.",
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
        "Dans ce guide, nous expliquons comment enregistrer vos humeurs, suivre votre sommeil, vos méditations et vos objectifs. C’est le point de départ recommandé pour les nouveaux utilisateurs.",
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

  // ---------------------------------------------------------------------------
  console.log("✅ Global seed MindfulSpace complet !");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
