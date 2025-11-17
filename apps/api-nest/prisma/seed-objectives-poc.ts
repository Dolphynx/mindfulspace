// prisma/seed-objectives-poc.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 POC Objectives – démarrage...");

  // 1️⃣ Récupérer les SessionTypes nécessaires
  // Noms à adapter si besoin en fonction de ton seed principal
  const sleepType = await prisma.sessionType.findFirst({
    where: { name: "Sleep" },
  });

  const meditationType = await prisma.sessionType.findFirst({
    where: { name: "Meditation" },
  });

  const exerciseType = await prisma.sessionType.findFirst({
    where: { name: "Exercise" },
  });

  if (!sleepType || !meditationType || !exerciseType) {
    console.error("❌ Impossible de trouver les SessionTypes 'Sleep' ou 'Meditation'.");
    console.error(
      "   → Vérifie les noms dans la table SessionType ou adapte ce script."
    );
    process.exit(1);
  }

  console.log("✅ SessionTypes récupérés :", {
    sleepType: sleepType.name,
    meditationType: meditationType.name,
  });

  // 2️⃣ Créer / récupérer le user de démo
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@mindfulspace.app" },
    update: {},
    create: {
      email: "demo@mindfulspace.app",
      displayName: "Demo User",
    },
  });

  console.log("✅ User de démo :", demoUser.email);

  // 3️⃣ Nettoyer les sessions existantes de ce user (sans toucher aux autres)
  console.log("🔄 Suppression des sessions existantes du demoUser...");
  await prisma.session.deleteMany({
    where: { userId: demoUser.id },
  });

  // 4️⃣ Générer des sessions pour les 14 derniers jours
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
    d.setHours(0, 0, 0, 0);

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

    // Exercice : par ex. 10–90 minutes
    const exerciseMinutes = 10 + Math.floor(Math.random() * 81); // 10–40
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

  // 5️⃣ Créer un objectif de sommeil pour le demoUser
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
      // startsAt: laissé par défaut (now) si tu as un default(now())
    },
  });

  console.log("✅ Objectif créé pour le demoUser");
  console.log("✅ Seed POC Objectives terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur dans le seed POC Objectives :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
