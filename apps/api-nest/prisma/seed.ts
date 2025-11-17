import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Clearing existing data...");
  await prisma.session.deleteMany();
  await prisma.sessionType.deleteMany();
  await prisma.sessionUnit.deleteMany();
  await prisma.testData.deleteMany(); // keep from your old seed

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

  console.log("🌱 Seeding SessionUnits...");
  const hoursUnit = await prisma.sessionUnit.create({
    data: { value: "Hours" },
  });

  const minutesUnit = await prisma.sessionUnit.create({
    data: { value: "Minutes" },
  });

  console.log("🌱 Seeding SessionTypes...");
  const sleepType = await prisma.sessionType.create({
    data: {
      name: "Sleep",
      sessionUnitId: hoursUnit.id,
    },
  });

  const exerciseType = await prisma.sessionType.create({
    data: {
      name: "Exercise",
      sessionUnitId: minutesUnit.id,
    },
  });

  const meditationType = await prisma.sessionType.create({
    data: {
      name: "Meditation",
      sessionUnitId: minutesUnit.id, // reuse same "Minutes" unit
    },
  });

  console.log("✅ Created session types:");
  console.table([
    { name: sleepType.name, unit: "Hours" },
    { name: exerciseType.name, unit: "Minutes" },
    { name: meditationType.name, unit: "Minutes" },
  ]);

  console.log("🌱 Creating demo user...");
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@mindfulspace.app" },
    update: {},
    create: {
      email: "demo@mindfulspace.app",
      displayName: "Demo User",
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
