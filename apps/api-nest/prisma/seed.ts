import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Clearing existing data...");
  await prisma.session.deleteMany();
  await prisma.sessionTypeUnit.deleteMany();
  await prisma.sessionType.deleteMany();
  await prisma.sessionUnit.deleteMany();
  await prisma.testData.deleteMany();

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
  const sleepType = await prisma.sessionType.create({ data: { name: "Sleep" } });
  const exerciseType = await prisma.sessionType.create({ data: { name: "Exercise" } });
  const meditationType = await prisma.sessionType.create({ data: { name: "Meditation" } });

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

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
