import {
  PrismaClient,
  ResourceType,
  MeditationSessionSource,
  MeditationMode,
  MeditationVisualType,
  BadgeDomain,
  BadgeMetricType,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (auth + domain)...");

  // ---------------------------------------------------------------------------
  // 0. CLEAN DATABASE (SAFE pour les données métier)
  // ---------------------------------------------------------------------------
  console.log("🔄 Clearing existing domain data (safe)...");

  // D'abord les sessions et séries qui dépendent des users / types / contenus
  await prisma.exerciceSerie.deleteMany();      // dépend de ExerciceSession + ExerciceContent
  await prisma.exerciceStep.deleteMany();       // dépend de ExerciceContent
  await prisma.exerciceSession.deleteMany();    // dépend de User
  await prisma.sleepSession.deleteMany();       // dépend de User
  await prisma.meditationSession.deleteMany();  // dépend de User + MeditationType + MeditationContent

  // User-specific workout programs (copie de Program pour un user)
  await prisma.userProgramExerciceItem.deleteMany();
  await prisma.userProgramDay.deleteMany();
  await prisma.userProgram.deleteMany();

  // Programmes d'exercices (gabarits)
  await prisma.programExerciceItem.deleteMany();
  await prisma.programDay.deleteMany();
  await prisma.program.deleteMany();

  // Programmes & contenus de méditation (si présents)
  await prisma.meditationProgramItem?.deleteMany().catch(() => {});
  await prisma.meditationProgram?.deleteMany().catch(() => {});
  await prisma.meditationVisualConfig?.deleteMany().catch(() => {});
  await prisma.meditationContent?.deleteMany().catch(() => {});
  await prisma.meditationType?.deleteMany().catch(() => {});

  // Types d'exercices (moderne : ExerciceContent)
  await prisma.exerciceContent.deleteMany();

  // Resources (full reset)
  await prisma.resourceTagOnResource?.deleteMany().catch(() => {});
  await prisma.resource.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.resourceCategory.deleteMany();

  // Badges (d'abord les UserBadge, puis le catalogue)
  await prisma.userBadge.deleteMany();
  await prisma.badgeDefinition.deleteMany();

  console.log("✔ Domain data cleared.");

  // ---------------------------------------------------------------------------
  // 1. AUTH SEED : permissions, rôles, rolePermissions, users demo
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding authentication data...");

  // 1.1 Permissions
  console.log("📝 Creating permissions...");

  const permissions = [
    // User permissions
    { name: "users:read", description: "Read user profiles" },
    { name: "users:update", description: "Update user profiles" },
    { name: "users:delete", description: "Delete users" },
    { name: "users:manage", description: "Full user management" },

    // Session permissions
    { name: "sessions:create", description: "Create sessions" },
    { name: "sessions:read", description: "Read sessions" },
    { name: "sessions:update", description: "Update sessions" },
    { name: "sessions:delete", description: "Delete sessions" },

    // Objective permissions
    { name: "objectives:create", description: "Create objectives" },
    { name: "objectives:read", description: "Read objectives" },
    { name: "objectives:update", description: "Update objectives" },
    { name: "objectives:delete", description: "Delete objectives" },

    // Resource permissions
    { name: "resources:create", description: "Create resources" },
    { name: "resources:read", description: "Read resources" },
    { name: "resources:update", description: "Update resources" },
    { name: "resources:delete", description: "Delete resources" },

    // Admin permissions
    { name: "admin:access", description: "Access admin panel" },
    { name: "admin:manage", description: "Full admin privileges" },

    // Premium content
    { name: "premium:access", description: "Access premium content" },

    // Coach permissions
    { name: "coach:access", description: "Access coach features" },
    { name: "coach:manage-clients", description: "Manage client sessions" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // 1.2 Roles
  console.log("🎭 Creating roles...");

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with basic permissions",
    },
  });

  const premiumRole = await prisma.role.upsert({
    where: { name: "premium" },
    update: {},
    create: {
      name: "premium",
      description: "Premium user with access to exclusive content",
    },
  });

  const coachRole = await prisma.role.upsert({
    where: { name: "coach" },
    update: {},
    create: {
      name: "coach",
      description: "Coach with ability to manage clients",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full system access",
    },
  });

  console.log("✅ Created 4 roles: user, premium, coach, admin");

  // 1.3 RolePermissions
  console.log("🔗 Assigning permissions to roles...");

  const allPermissions = await prisma.permission.findMany();
  const getPermissionId = (name: string) =>
    allPermissions.find((p) => p.name === name)?.id || "";

  // User permissions
  const userPermissions = [
    "sessions:create",
    "sessions:read",
    "sessions:update",
    "sessions:delete",
    "objectives:create",
    "objectives:read",
    "objectives:update",
    "objectives:delete",
    "resources:read",
    "users:read",
    "users:update",
  ];

  for (const permName of userPermissions) {
    const permissionId = getPermissionId(permName);
    if (!permissionId) continue;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId,
      },
    });
  }

  // Premium permissions = user + premium:access
  const premiumPermissions = [...userPermissions, "premium:access"];

  for (const permName of premiumPermissions) {
    const permissionId = getPermissionId(permName);
    if (!permissionId) continue;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: premiumRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: premiumRole.id,
        permissionId,
      },
    });
  }

  // Coach permissions = premium + coach features + création/maj ressources
  const coachPermissions = [
    ...premiumPermissions,
    "coach:access",
    "coach:manage-clients",
    "resources:create",
    "resources:update",
  ];

  for (const permName of coachPermissions) {
    const permissionId = getPermissionId(permName);
    if (!permissionId) continue;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: coachRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: coachRole.id,
        permissionId,
      },
    });
  }

  // Admin = toutes les permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✅ Assigned permissions to all roles");

  // 1.4 Demo users
  console.log("👥 Creating demo users...");

  const demoPassword = "Demo123!";
  const hashedPassword = await argon2.hash(demoPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });

  // Regular User
  const demoUserRegular = await prisma.user.upsert({
    where: { email: "user@mindfulspace.app" },
    update: {
      emailVerified: true,
      isActive: true,
      displayName: "Demo User",
      password: hashedPassword,
    },
    create: {
      email: "user@mindfulspace.app",
      displayName: "Demo User",
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUserRegular.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUserRegular.id,
      roleId: userRole.id,
    },
  });

  console.log("  ✅ Created user@mindfulspace.app (role: user)");

  // Premium User
  const demoUserPremium = await prisma.user.upsert({
    where: { email: "premium@mindfulspace.app" },
    update: {},
    create: {
      email: "premium@mindfulspace.app",
      displayName: "Demo Premium User",
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUserPremium.id,
        roleId: premiumRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUserPremium.id,
      roleId: premiumRole.id,
    },
  });

  console.log("  ✅ Created premium@mindfulspace.app (role: premium)");

  // Coach User
  const demoUserCoach = await prisma.user.upsert({
    where: { email: "coach@mindfulspace.app" },
    update: {},
    create: {
      email: "coach@mindfulspace.app",
      displayName: "Demo Coach",
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUserCoach.id,
        roleId: coachRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUserCoach.id,
      roleId: coachRole.id,
    },
  });

  console.log("  ✅ Created coach@mindfulspace.app (role: coach)");

  // Admin User
  const demoUserAdmin = await prisma.user.upsert({
    where: { email: "admin@mindfulspace.app" },
    update: {},
    create: {
      email: "admin@mindfulspace.app",
      displayName: "Demo Admin",
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUserAdmin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUserAdmin.id,
      roleId: adminRole.id,
    },
  });

  console.log("  ✅ Created admin@mindfulspace.app (role: admin)");

  // User "demo@mindfulspace.app" utilisé pour les sessions de déмо
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@mindfulspace.app" },
    update: {},
    create: {
      email: "demo@mindfulspace.app",
      displayName: "Demo User",
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      roleId: userRole.id,
    },
  });

  console.log(
    "  ✅ Created demo@mindfulspace.app (role: user, used for sample sessions)"
  );

  console.log("\n📊 Auth seed summary:");
  console.log("  • Roles: user, premium, coach, admin");
  console.log("  • Permissions:", allPermissions.length);
  console.log("  • Demo Users (password: Demo123!):");
  console.log("    - user@mindfulspace.app (user)");
  console.log("    - premium@mindfulspace.app (premium)");
  console.log("    - coach@mindfulspace.app (coach)");
  console.log("    - admin@mindfulspace.app (admin)");
  console.log("    - demo@mindfulspace.app (user, pour les données de déмо)");
  console.log("✅ All passwords are properly hashed with Argon2id");

  // ---------------------------------------------------------------------------
  // 2. SEED DOMAIN MODELS (méditations, exercices, ressources…)
  // ---------------------------------------------------------------------------

  // 2.1 MeditationType
  console.log("🌱 Seeding meditation types...");

  const meditationTypesData = [
    { slug: "breathing", sortOrder: 10 },
    { slug: "mindfulness", sortOrder: 20 },
    { slug: "body-scan", sortOrder: 30 },
    { slug: "compassion", sortOrder: 40 },
  ];

  const meditationTypes = [];

  for (const type of meditationTypesData) {
    const created = await prisma.meditationType.upsert({
      where: { slug: type.slug },
      update: {},
      create: {
        slug: type.slug,
        isActive: true,
        sortOrder: type.sortOrder,
      },
    });
    meditationTypes.push(created);
  }

  console.log(`✔ ${meditationTypes.length} meditation types seeded.`);

  const breathingType = meditationTypes.find((t) => t.slug === "breathing");
  const mindfulnessType = meditationTypes.find((t) => t.slug === "mindfulness");
  const bodyScanType = meditationTypes.find((t) => t.slug === "body-scan");
  const compassionType = meditationTypes.find((t) => t.slug === "compassion");

  if (!breathingType || !mindfulnessType || !bodyScanType || !compassionType) {
    throw new Error("Meditation types not properly seeded");
  }

  // 2.2 MeditationContent
  console.log("🌱 Seeding meditation contents...");

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
      title: "Flamme de présence (timer)",
      description:
        "Fixez la flamme d’une bougie et revenez doucement à l’instant présent.",
      defaultMeditationTypeId: mindfulnessType.id,
      mode: MeditationMode.TIMER,
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
      title: "Body scan avec silhouette (timer)",
      description:
        "Une silhouette s’illumine progressivement pour accompagner le relâchement.",
      defaultMeditationTypeId: bodyScanType.id,
      mode: MeditationMode.TIMER,
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
      title: "Cercle de bienveillance (timer)",
      description:
        "Visualisez un cercle de lumière qui s’élargit pour inclure d’autres personnes.",
      defaultMeditationTypeId: compassionType.id,
      mode: MeditationMode.TIMER,
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

  // 2.3 Visual config
  console.log("🌱 Seeding visual configs for meditation contents...");

  const breathingVisual = meditationContents.find(
    (c) => c.title === "Respiration en vagues (visuelle)"
  );

  if (breathingVisual) {
    await prisma.meditationVisualConfig.create({
      data: {
        meditationContentId: breathingVisual.id,
        visualType: MeditationVisualType.CIRCLE_PULSE,
        configJson: {
          totalCycles: 3,
          inhaleMs: 4000,
          holdFullMs: 4000,
          exhaleMs: 4000,
          holdEmptyMs: 0,
          minScale: 0.9,
          maxScale: 1.1,
        },
      },
    });
    console.log("✔ Visual config seeded for breathing visual content.");
  } else {
    console.warn(
      "⚠ Breathing visual content not found, visual config not seeded."
    );
  }

  // 2.4 Exercises
  console.log("🌱 Seeding exercise types...");

  const baseExercises = [
    { name: "Push Ups", Description: "Upper-body bodyweight press" },
    { name: "Pull Ups", Description: "Back and biceps bodyweight pull" },
    { name: "Squats", Description: "Lower-body compound movement" },
    { name: "Plank", Description: "Core stabilization exercise" },
    { name: "Burpees", Description: "Full-body conditioning move" },
    { name: "Bench Press", Description: "Chest compound barbell lift" },
    { name: "Deadlift", Description: "Posterior chain barbell lift" },
    { name: "Overhead Press", Description: "Shoulder barbell press" },
  ];

  for (const ex of baseExercises) {
    await prisma.exerciceContent.create({
      data: ex,
    });
  }

  console.log("✔ Base exercises seeded.");

  console.log("🌞 Seeding Sun Salutation...");

  const sunSalutation = await prisma.exerciceContent.create({
    data: {
      name: "Sun Salutation",
      Description: "A traditional flowing sequence of yoga postures.",
    },
  });

  const sunSalutationSteps = [
    {
      order: 1,
      title: "Pranamasana — Prayer Pose",
      description:
        "Stand at the front of your mat, palms together, grounding your breath.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step1_yg3zqf.png",
    },
    {
      order: 2,
      title: "Hasta Uttanasana — Raised Arms Pose",
      description: "Lift your arms overhead, gently arching your spine.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step2_a8nuxy.png",
    },
    {
      order: 3,
      title: "Uttanasana — Standing Forward Bend",
      description:
        "Fold forward from the hips, bringing hands toward the floor.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step3_juamaz.png",
    },
    {
      order: 4,
      title: "Ashwa Sanchalanasana — Low Lunge",
      description:
        "Step your right foot back, lowering the knee to the mat, gaze forward.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step4_pt4yqs.png",
    },
    {
      order: 5,
      title: "Plank Pose",
      description: "Step back into a strong plank, engaging the core.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step5_cm0aiy.png",
    },
    {
      order: 6,
      title: "Ashtanga Namaskara — Eight-Limbed Pose",
      description:
        "Lower knees, chest, and chin to the mat while hips stay raised.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step6_xuj9pj.png",
    },
    {
      order: 7,
      title: "Bhujangasana — Cobra Pose",
      description:
        "Lift your chest into a gentle backbend, elbows close to your ribs.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step7_fwjut5.png",
    },
    {
      order: 8,
      title: "Adho Mukha Svanasana — Downward Dog",
      description: "Lift hips up, forming an inverted V-shape with your body.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step8_tfmvoh.png",
    },
    {
      order: 9,
      title: "Ashwa Sanchalanasana — Low Lunge (other side)",
      description: "Step your right foot forward this time, gaze ahead.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step9_mmp9ls.png",
    },
    {
      order: 10,
      title: "Uttanasana — Standing Forward Bend",
      description:
        "Fold forward again from the hips, relaxing your neck.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step10_fcuivq.png",
    },
    {
      order: 11,
      title: "Hasta Uttanasana → Pranamasana",
      description:
        "Rise up with arms overhead, then return palms to heart center.",
      imageUrl:
        "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step11_gkfzr7.png",
    },
  ];

  for (const step of sunSalutationSteps) {
    await prisma.exerciceStep.create({
      data: {
        exerciceContentId: sunSalutation.id,
        order: step.order,
        title: step.title,
        description: step.description,
        imageUrl: step.imageUrl,
      },
    });
  }

  console.log("✔ Sun Salutation seeded with 11 steps.");
  console.log("✔ ExerciceType seeded");

  // ---------------------------------------------------------------------------
  // 2.x Workout Programs (demo)
  // ---------------------------------------------------------------------------
  console.log("🌱 Seeding workout programs...");

  // Get some exercise type IDs
  const pushUps = await prisma.exerciceContent.findUnique({ where: { name: "Push Ups" } });
  const squats = await prisma.exerciceContent.findUnique({ where: { name: "Squats" } });
  const plank = await prisma.exerciceContent.findUnique({ where: { name: "Plank" } });
  const burpees = await prisma.exerciceContent.findUnique({ where: { name: "Burpees" } });

  if (!pushUps || !squats || !plank || !burpees) {
    throw new Error("Some required exercise types not found");
  }

  // Program #1
  await prisma.program.create({
    data: {
      title: "Full Body Beginner",
      description: "A simple 2-day full body routine.",
      days: {
        create: [
          {
            title: "Day 1 – Full Body A",
            order: 1,
            weekday: 1,
            exerciceItems: {
              create: [
                { exerciceContentId: pushUps.id, defaultRepetitionCount: 10, defaultSets: 3 },
                { exerciceContentId: squats.id, defaultRepetitionCount: 12, defaultSets: 3 },
              ],
            },
          },
          {
            title: "Day 2 – Full Body B",
            order: 2,
            weekday: 3,
            exerciceItems: {
              create: [
                { exerciceContentId: plank.id, defaultRepetitionCount: 1, defaultSets: 3 },
                { exerciceContentId: burpees.id, defaultRepetitionCount: 8, defaultSets: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // Program #2
  await prisma.program.create({
    data: {
      title: "Upper / Lower Split",
      description: "Classic 4-day weekly split.",
      days: {
        create: [
          {
            title: "Upper",
            order: 1,
            weekday: 1,
            exerciceItems: {
              create: [
                { exerciceContentId: pushUps.id, defaultRepetitionCount: 10, defaultSets: 4 },
                { exerciceContentId: plank.id, defaultRepetitionCount: 1, defaultSets: 3 },
              ],
            },
          },
          {
            title: "Lower",
            order: 2,
            weekday: 3,
            exerciceItems: {
              create: [
                { exerciceContentId: squats.id, defaultRepetitionCount: 12, defaultSets: 4 },
                { exerciceContentId: burpees.id, defaultRepetitionCount: 10, defaultSets: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✔ Workout programs seeded.");

  // 2.5 Sessions demo liées au user "demo@..."
  console.log("🌱 Creating workout / sleep / meditation sessions for demo user...");

  const workout = await prisma.exerciceSession.create({
    data: {
      quality: 4,
      dateSession: new Date(),
      userId: demoUser.id,
      exerciceSerie: {
        create: [
          {
            exerciceContent: { connect: { name: "Push Ups" } },
            repetitionCount: 20,
          },
          {
            exerciceContent: { connect: { name: "Squats" } },
            repetitionCount: 15,
          },
        ],
      },
    },
  });

  console.log("✔ WorkoutSession seeded:", workout.id);

  await prisma.sleepSession.create({
    data: {
      hours: 7,
      quality: 4,
      dateSession: new Date(),
      userId: demoUser.id,
    },
  });

  console.log("✔ SleepSession seeded.");

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
        meditationContentId: null,
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

  // 2.6 Resources
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
      isPremium: true,
      readTimeMin: 5,
      authorName: "Équipe MindfulSpace",
      categoryId: guideCat.id,
      tags: {
        create: [{ tag: { connect: { slug: "wellness" } } }],
      },
    },
  });

  console.log("✔ Resources seeded.");

  // 2.7 Badges (definitions uniquement, pas de UserBadge)
  console.log("🌱 Seeding badge definitions...");

  type BadgeSeed = {
    slug: string;
    domain: BadgeDomain;
    metric: BadgeMetricType;
    threshold: number;
    titleKey: string;
    descriptionKey: string;
    iconKey?: string | null;
    highlightDurationHours?: number | null;
    sortOrder: number;
  };

  const badgeDefinitionsData: BadgeSeed[] = [
    {
      slug: "first-meditation",
      domain: BadgeDomain.MEDITATION,
      metric: BadgeMetricType.TOTAL_MEDITATION_SESSIONS,
      threshold: 1,
      titleKey: "badges.meditation.first.title",
      descriptionKey: "badges.meditation.first.description",
      iconKey: "badge-meditation-1.png",
      highlightDurationHours: 168, // 7 jours
      sortOrder: 10,
    },
    {
      slug: "five-meditations",
      domain: BadgeDomain.MEDITATION,
      metric: BadgeMetricType.TOTAL_MEDITATION_SESSIONS,
      threshold: 5,
      titleKey: "badges.meditation.five.title",
      descriptionKey: "badges.meditation.five.description",
      iconKey: "badge-meditation-5.png",
      highlightDurationHours: 168,
      sortOrder: 20,
    },
    {
      slug: "meditation-streak-3",
      domain: BadgeDomain.MEDITATION,
      metric: BadgeMetricType.MEDITATION_STREAK_DAYS,
      threshold: 3,
      titleKey: "badges.meditation.streak3.title",
      descriptionKey: "badges.meditation.streak3.description",
      iconKey: "badge-meditation-streak-3.png",
      highlightDurationHours: 168,
      sortOrder: 30,
    },
    {
      slug: "first-exercice",
      domain: BadgeDomain.EXERCICE,
      metric: BadgeMetricType.TOTAL_EXERCICE_SESSIONS,
      threshold: 1,
      titleKey: "badges.exercice.first.title",
      descriptionKey: "badges.exercice.first.description",
      iconKey: "badge-exercice-1.png",
      highlightDurationHours: 168,
      sortOrder: 40,
    },
    {
      slug: "first-sleep",
      domain: BadgeDomain.SLEEP,
      metric: BadgeMetricType.TOTAL_SLEEP_NIGHTS,
      threshold: 1,
      titleKey: "badges.sleep.first.title",
      descriptionKey: "badges.sleep.first.description",
      iconKey: "badge-sleep-1.png",
      highlightDurationHours: 168,
      sortOrder: 50,
    },
    {
      slug: "first-session-any",
      domain: BadgeDomain.GENERIC,
      metric: BadgeMetricType.TOTAL_SESSIONS_ANY,
      threshold: 1,
      titleKey: "badges.generic.firstSession.title",
      descriptionKey: "badges.generic.firstSession.description",
      iconKey: "badge-generic-start.png",
      highlightDurationHours: 168,
      sortOrder: 5,
    },
  ];

  for (const badge of badgeDefinitionsData) {
    await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: {
        domain: badge.domain,
        metric: badge.metric,
        threshold: badge.threshold,
        titleKey: badge.titleKey,
        descriptionKey: badge.descriptionKey,
        iconKey: badge.iconKey ?? null,
        highlightDurationHours: badge.highlightDurationHours ?? null,
        sortOrder: badge.sortOrder,
        isActive: true,
      },
      create: {
        slug: badge.slug,
        domain: badge.domain,
        metric: badge.metric,
        threshold: badge.threshold,
        titleKey: badge.titleKey,
        descriptionKey: badge.descriptionKey,
        iconKey: badge.iconKey ?? null,
        highlightDurationHours: badge.highlightDurationHours ?? null,
        sortOrder: badge.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`✔ ${badgeDefinitionsData.length} badge definitions seeded.`);

    // 2.8 Demo user badges (lier quelques badges de base à demoUser)
    console.log("🌱 Seeding demo user badges...");

    // On associe par exemple les badges "first-meditation" et "first-sleep" au demoUser
    const demoUserBadgeDefinitions = await prisma.badgeDefinition.findMany({
        where: {
            slug: { in: ["first-meditation", "first-sleep"] },
        },
    });

    for (const def of demoUserBadgeDefinitions) {
        await prisma.userBadge.create({
            data: {
                userId: demoUser.id,
                badgeId: def.id,
            },
        });
    }

    console.log(
        `✔ Seeded ${demoUserBadgeDefinitions.length} badges for demo user.`,
    );


    console.log("🌱 Seeding done.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    prisma
      .$disconnect()
      .catch(() => process.exit(1));
  });
