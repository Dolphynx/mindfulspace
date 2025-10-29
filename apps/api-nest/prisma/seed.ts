import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoData = [
  { metricName: 'daily_meditation_minutes', label: 'Lun', metricValue: 12 },
  { metricName: 'daily_meditation_minutes', label: 'Mar', metricValue: 9 },
  { metricName: 'daily_meditation_minutes', label: 'Mer', metricValue: 15 },
  { metricName: 'daily_meditation_minutes', label: 'Jeu', metricValue: 7 },
  { metricName: 'daily_meditation_minutes', label: 'Ven', metricValue: 14 },
  { metricName: 'daily_meditation_minutes', label: 'Sam', metricValue: 5 },
  { metricName: 'daily_meditation_minutes', label: 'Dim', metricValue: 11 }
];

async function main() {
  const existing = await prisma.testData.count();
  if (existing === 0) {
    await prisma.testData.createMany({ data: demoData });
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
