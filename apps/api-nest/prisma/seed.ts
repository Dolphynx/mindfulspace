import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1️⃣ Seed Exercise Types
  const exerciceTypes = [
    { name: 'Push Ups', Description: 'Upper-body bodyweight press' },
    { name: 'Pull Ups', Description: 'Back and biceps bodyweight pull' },
    { name: 'Squats', Description: 'Lower-body compound movement' },
    { name: 'Plank', Description: 'Core stabilization exercise' },
    { name: 'Burpees', Description: 'Full-body conditioning move' },
    { name: 'Bench Press', Description: 'Chest compound barbell lift' },
    { name: 'Deadlift', Description: 'Posterior chain barbell lift' },
    { name: 'Overhead Press', Description: 'Shoulder barbell press' },
  ];

  for (const type of exerciceTypes) {
    await prisma.exerciceType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log('✔ ExerciceType seeded');

  // 2️⃣ Optional: Seed a sample workout session

  const workout = await prisma.workoutSession.create({
    data: {
      quality: 4,
      dateSession: new Date(),
      exerciceSessions: {
        create: [
          {
            exerciceType: { connect: { name: 'Push Ups' } },
            repetitionCount: 20,
          },
          {
            exerciceType: { connect: { name: 'Squats' } },
            repetitionCount: 15,
          },
        ],
      },
    },
  });

  console.log('✔ WorkoutSession seeded:', workout.id);


  // 3️⃣ Optional: Seed a SleepSession

  await prisma.sleepSession.create({
    data: {
      hours: 7,
      quality: 4,
      dateSession: new Date(),
    },
  });


  // 4️⃣ Optional: Seed a MeditationSession

  await prisma.meditationSession.create({
    data: {
      duration: 15,
      quality: 5,
      dateSession: new Date(),
    },
  });


  console.log('🌱 Seeding done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
