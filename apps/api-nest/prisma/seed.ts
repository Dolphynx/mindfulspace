import {
  PrismaClient,
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
  await prisma.exerciceStepTranslation?.deleteMany().catch(() => {}); // delete translations first
  await prisma.exerciceStep.deleteMany();       // dépend de ExerciceContent
  await prisma.exerciceSession.deleteMany();    // dépend de User
  await prisma.sleepSession.deleteMany();       // dépend de User
  await prisma.meditationSession.deleteMany();  // dépend de User + MeditationType + MeditationContent

  // User-specific workout programs (copie de Program pour un user)
  await prisma.userProgramExerciceItem.deleteMany();
  await prisma.userProgramDay.deleteMany();
  await prisma.userProgram.deleteMany();

  // Programmes d'exercices (gabarits) - delete translations first
  await prisma.programExerciceItem.deleteMany();
  await prisma.programDayTranslation?.deleteMany().catch(() => {});
  await prisma.programDay.deleteMany();
  await prisma.programTranslation?.deleteMany().catch(() => {});
  await prisma.program.deleteMany();

  // Programmes & contenus de méditation (si présents)
  await prisma.meditationProgramItem?.deleteMany().catch(() => {});
  await prisma.meditationProgram?.deleteMany().catch(() => {});
  await prisma.meditationVisualConfig?.deleteMany().catch(() => {});
  await prisma.meditationContent?.deleteMany().catch(() => {});
  await prisma.meditationType?.deleteMany().catch(() => {});

  // Types d'exercices (moderne : ExerciceContent) - delete translations first
  await prisma.exerciceContentTranslation?.deleteMany().catch(() => {});
  await prisma.exerciceContent.deleteMany();

  // Resources (full reset - delete translations first due to cascade)
  await prisma.resourceTagOnResource?.deleteMany().catch(() => {});
  await prisma.resourceTranslation?.deleteMany().catch(() => {});
  await prisma.resource.deleteMany();
  await prisma.resourceTagTranslation?.deleteMany().catch(() => {});
  await prisma.resourceTag.deleteMany();
  await prisma.resourceCategoryTranslation?.deleteMany().catch(() => {});
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
    soundcloudUrl?: string | null;
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
      mediaUrl: "/audio/respi_751ko.mp3"
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
      mediaUrl: "/audio/respi_751ko.mp3"
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
      mediaUrl: "/audio/respi_751ko.mp3"
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
      mediaUrl: "/audio/respi_751ko.mp3"
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
        soundcloudUrl: content.soundcloudUrl ?? null,
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

  console.log("🌍 Seeding languages...");

  const [en, fr] = await Promise.all([
    prisma.language.upsert({
      where: { code: "en" },
      update: {},
      create: { code: "en", name: "English" },
    }),
    prisma.language.upsert({
      where: { code: "fr" },
      update: {},
      create: { code: "fr", name: "Français" },
    }),
  ]);

  console.log("🌱 Seeding exercise contents...");

  const baseExercises = [
    {
      en: { name: "Push Ups", description: "Upper-body bodyweight press" },
      fr: { name: "Pompes", description: "Exercice au poids du corps pour le haut du corps" },
    },
    {
      en: { name: "Pull Ups", description: "Back and biceps bodyweight pull" },
      fr: { name: "Tractions", description: "Exercice de tirage pour le dos et les biceps" },
    },
    {
      en: { name: "Squats", description: "Lower-body compound movement" },
      fr: { name: "Squats", description: "Mouvement polyarticulaire du bas du corps" },
    },
    {
      en: { name: "Plank", description: "Core stabilization exercise" },
      fr: { name: "Gainage", description: "Exercice de stabilisation du tronc" },
    },
    {
      en: { name: "Burpees", description: "Full-body conditioning move" },
      fr: { name: "Burpees", description: "Exercice complet de conditionnement physique" },
    },
    {
      en: { name: "Bench Press", description: "Chest compound barbell lift" },
      fr: { name: "Développé couché", description: "Exercice polyarticulaire pour les pectoraux" },
    },
    {
      en: { name: "Deadlift", description: "Posterior chain barbell lift" },
      fr: { name: "Soulevé de terre", description: "Exercice pour la chaîne postérieure" },
    },
    {
      en: { name: "Overhead Press", description: "Shoulder barbell press" },
      fr: { name: "Développé militaire", description: "Exercice de poussée pour les épaules" },
    },
  ];

  const exerciceMap = new Map<string, string>();

  for (const ex of baseExercises) {
    const content = await prisma.exerciceContent.create({
      data: {
        translations: {
          create: [
            { languageCode: "en", ...ex.en },
            { languageCode: "fr", ...ex.fr },
          ],
        },
      },
    });

    exerciceMap.set(ex.en.name, content.id);
  }

  console.log("✔ Base exercises seeded.");

  console.log("🌞 Seeding Sun Salutation (EN + FR)...");

  const sunSalutation = await prisma.exerciceContent.create({
    data: {
      translations: {
        create: [
          {
            languageCode: "en",
            name: "Sun Salutation",
            description: "A traditional flowing sequence of yoga postures.",
          },
          {
            languageCode: "fr",
            name: "Salutation au soleil",
            description: "Une séquence fluide traditionnelle de postures de yoga.",
          },
        ],
      },
    },
  });

  const sunSalutationSteps = [
    {
      order: 1,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step1_yg3zqf.png",
      en: {
        title: "Pranamasana — Prayer Pose",
        description: "Stand at the front of your mat, palms together, grounding your breath.",
      },
      fr: {
        title: "Pranamasana — Posture de la prière",
        description: "Debout en haut du tapis, mains jointes, stabilisez votre respiration.",
      },
    },
    {
      order: 2,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step2_a8nuxy.png",
      en: {
        title: "Hasta Uttanasana — Raised Arms Pose",
        description: "Lift your arms overhead, gently arching your spine.",
      },
      fr: {
        title: "Hasta Uttanasana — Bras levés",
        description: "Levez les bras au-dessus de la tête en arquant légèrement la colonne.",
      },
    },
    {
      order: 3,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step3_juamaz.png",
      en: {
        title: "Uttanasana — Standing Forward Bend",
        description: "Fold forward from the hips, bringing hands toward the floor.",
      },
      fr: {
        title: "Uttanasana — Flexion avant debout",
        description: "Inclinez-vous vers l’avant depuis les hanches, mains vers le sol.",
      },
    },
    {
      order: 4,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step4_pt4yqs.png",
      en: {
        title: "Ashwa Sanchalanasana — Low Lunge",
        description: "Step your right foot back, lowering the knee to the mat, gaze forward.",
      },
      fr: {
        title: "Ashwa Sanchalanasana — Fente basse",
        description: "Reculez le pied droit, genou au sol, regard vers l’avant.",
      },
    },
    {
      order: 5,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step5_cm0aiy.png",
      en: {
        title: "Plank Pose",
        description: "Step back into a strong plank, engaging the core.",
      },
      fr: {
        title: "Planche",
        description: "Reculez dans une planche solide en engageant le centre du corps.",
      },
    },
    {
      order: 6,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step6_xuj9pj.png",
      en: {
        title: "Ashtanga Namaskara — Eight-Limbed Pose",
        description: "Lower knees, chest, and chin to the mat while hips stay raised.",
      },
      fr: {
        title: "Ashtanga Namaskara — Posture aux huit points",
        description: "Abaissez genoux, poitrine et menton au sol, hanches levées.",
      },
    },
    {
      order: 7,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step7_fwjut5.png",
      en: {
        title: "Bhujangasana — Cobra Pose",
        description: "Lift your chest into a gentle backbend, elbows close to your ribs.",
      },
      fr: {
        title: "Bhujangasana — Cobra",
        description: "Soulevez la poitrine en légère extension, coudes près du corps.",
      },
    },
    {
      order: 8,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159118/step8_tfmvoh.png",
      en: {
        title: "Adho Mukha Svanasana — Downward Dog",
        description: "Lift hips up, forming an inverted V-shape with your body.",
      },
      fr: {
        title: "Adho Mukha Svanasana — Chien tête en bas",
        description: "Levez les hanches pour former un V inversé avec le corps.",
      },
    },
    {
      order: 9,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step9_mmp9ls.png",
      en: {
        title: "Ashwa Sanchalanasana — Low Lunge (other side)",
        description: "Step your right foot forward this time, gaze ahead.",
      },
      fr: {
        title: "Ashwa Sanchalanasana — Fente basse (autre côté)",
        description: "Avancez le pied droit cette fois, regard vers l’avant.",
      },
    },
    {
      order: 10,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step10_fcuivq.png",
      en: {
        title: "Uttanasana — Standing Forward Bend",
        description: "Fold forward again from the hips, relaxing your neck.",
      },
      fr: {
        title: "Uttanasana — Flexion avant debout",
        description: "Repliez-vous à nouveau vers l’avant en relâchant la nuque.",
      },
    },
    {
      order: 11,
      imageUrl: "https://res.cloudinary.com/dnkpch0ny/image/upload/v1764159119/step11_gkfzr7.png",
      en: {
        title: "Hasta Uttanasana → Pranamasana",
        description: "Rise up with arms overhead, then return palms to heart center.",
      },
      fr: {
        title: "Hasta Uttanasana → Pranamasana",
        description: "Redressez-vous bras levés puis ramenez les mains au cœur.",
      },
    },
  ];

  for (const step of sunSalutationSteps) {
    await prisma.exerciceStep.create({
      data: {
        exerciceContentId: sunSalutation.id,
        order: step.order,
        imageUrl: step.imageUrl,
        translations: {
          create: [
            { languageCode: "en", ...step.en },
            { languageCode: "fr", ...step.fr },
          ],
        },
      },
    });
  }

  console.log("✔ Sun Salutation seeded with 11 steps (EN + FR).");


  console.log("🌱 Seeding workout programs...");

  const pushUpsId = exerciceMap.get("Push Ups")!;
  const squatsId = exerciceMap.get("Squats")!;
  const plankId = exerciceMap.get("Plank")!;
  const burpeesId = exerciceMap.get("Burpees")!;


  await prisma.program.create({
    data: {
      translations: {
        create: [
          {
            languageCode: "en",
            title: "Full Body Beginner",
            description: "A simple 2-day full body routine.",
          },
          {
            languageCode: "fr",
            title: "Full Body Débutant",
            description: "Routine simple sur 2 jours pour tout le corps.",
          },
        ],
      },
      days: {
        create: [
          {
            order: 1,
            weekday: 1,
            translations: {
              create: [
                { languageCode: "en", title: "Day 1 – Full Body A" },
                { languageCode: "fr", title: "Jour 1 – Full Body A" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: pushUpsId, defaultRepetitionCount: 10, defaultSets: 3 },
                { exerciceContentId: squatsId, defaultRepetitionCount: 12, defaultSets: 3 },
              ],
            },
          },
          {
            order: 2,
            weekday: 3,
            translations: {
              create: [
                { languageCode: "en", title: "Day 2 – Full Body B" },
                { languageCode: "fr", title: "Jour 2 – Full Body B" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: plankId, defaultRepetitionCount: 1, defaultSets: 3 },
                { exerciceContentId: burpeesId, defaultRepetitionCount: 8, defaultSets: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("🌱 Seeding Daily Movement program (7 days)...");

  await prisma.program.create({
    data: {
      translations: {
        create: [
          {
            languageCode: "en",
            title: "Daily Movement",
            description: "A balanced program with something to do every day of the week.",
          },
          {
            languageCode: "fr",
            title: "Mouvement quotidien",
            description: "Un programme équilibré avec une activité chaque jour de la semaine.",
          },
        ],
      },
      days: {
        create: [
          {
            order: 1,
            weekday: 1,
            translations: {
              create: [
                { languageCode: "en", title: "Monday – Upper Body" },
                { languageCode: "fr", title: "Lundi – Haut du corps" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: pushUpsId, defaultRepetitionCount: 12, defaultSets: 3 },
                { exerciceContentId: plankId, defaultRepetitionCount: 1, defaultSets: 3 },
              ],
            },
          },
          {
            order: 2,
            weekday: 2,
            translations: {
              create: [
                { languageCode: "en", title: "Tuesday – Lower Body" },
                { languageCode: "fr", title: "Mardi – Bas du corps" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: squatsId, defaultRepetitionCount: 15, defaultSets: 3 },
                { exerciceContentId: burpeesId, defaultRepetitionCount: 8, defaultSets: 2 },
              ],
            },
          },
          {
            order: 3,
            weekday: 3,
            translations: {
              create: [
                { languageCode: "en", title: "Wednesday – Core & Stability" },
                { languageCode: "fr", title: "Mercredi – Gainage & stabilité" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: plankId, defaultRepetitionCount: 1, defaultSets: 4 },
              ],
            },
          },
          {
            order: 4,
            weekday: 4,
            translations: {
              create: [
                { languageCode: "en", title: "Thursday – Conditioning" },
                { languageCode: "fr", title: "Jeudi – Cardio & conditionnement" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: burpeesId, defaultRepetitionCount: 10, defaultSets: 3 },
              ],
            },
          },
          {
            order: 5,
            weekday: 5,
            translations: {
              create: [
                { languageCode: "en", title: "Friday – Full Body" },
                { languageCode: "fr", title: "Vendredi – Corps entier" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: pushUpsId, defaultRepetitionCount: 10, defaultSets: 3 },
                { exerciceContentId: squatsId, defaultRepetitionCount: 12, defaultSets: 3 },
              ],
            },
          },
          {
            order: 6,
            weekday: 6,
            translations: {
              create: [
                { languageCode: "en", title: "Saturday – Yoga Flow" },
                { languageCode: "fr", title: "Samedi – Flow yoga" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: sunSalutation.id, defaultRepetitionCount: 1, defaultSets: 2 },
              ],
            },
          },
          {
            order: 7,
            weekday: 7,
            translations: {
              create: [
                { languageCode: "en", title: "Sunday – Light Movement" },
                { languageCode: "fr", title: "Dimanche – Mouvement doux" },
              ],
            },
            exerciceItems: {
              create: [
                { exerciceContentId: plankId, defaultRepetitionCount: 1, defaultSets: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✔ Daily Movement program seeded.");


  console.log("🌱 Creating demo workout session...");

  await prisma.exerciceSession.create({
    data: {
      quality: 4,
      dateSession: new Date(),
      userId: demoUser.id,
      exerciceSerie: {
        create: [
          { exerciceContentId: pushUpsId, repetitionCount: 20 },
          { exerciceContentId: squatsId, repetitionCount: 15 },
        ],
      },
    },
  });

  console.log("✔ Workout session seeded.");



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

  // Create categories with translations
  const articleCat = await prisma.resourceCategory.create({
    data: {
      slug: "articles",
      iconEmoji: "📄",
      sourceLocale: "en",
      translations: {
        create: [
          { locale: "en", name: "Articles" },
          { locale: "fr", name: "Articles" },
        ],
      },
    },
  });

  const guideCat = await prisma.resourceCategory.create({
    data: {
      slug: "guides",
      iconEmoji: "📘",
      sourceLocale: "en",
      translations: {
        create: [
          { locale: "en", name: "Guides" },
          { locale: "fr", name: "Guides" },
        ],
      },
    },
  });

  // Create tags with translations
  const meditationTag = await prisma.resourceTag.create({
    data: {
      slug: "meditation",
      sourceLocale: "en",
      translations: {
        create: [
          { locale: "en", name: "Meditation" },
          { locale: "fr", name: "Méditation" },
        ],
      },
    },
  });

  const mentalHealthTag = await prisma.resourceTag.create({
    data: {
      slug: "mental-health",
      sourceLocale: "en",
      translations: {
        create: [
          { locale: "en", name: "Mental health" },
          { locale: "fr", name: "Santé mentale" },
        ],
      },
    },
  });

  const wellnessTag = await prisma.resourceTag.create({
    data: {
      slug: "wellness",
      sourceLocale: "en",
      translations: {
        create: [
          { locale: "en", name: "Wellness" },
          { locale: "fr", name: "Bien-être" },
        ],
      },
    },
  });

  const createArticle = (data: {
    slug: string;
    titleEn: string;
    titleFr: string;
    summaryEn: string;
    summaryFr: string;
    contentEn: string;
    contentFr: string;
    isPremium?: boolean;
    isFeatured?: boolean;
    readTimeMin?: number;
    tags: string[];
    sourceLocale?: string;
  }) =>
    prisma.resource.create({
      data: {
        slug: data.slug,
        isPremium: data.isPremium ?? false,
        isFeatured: data.isFeatured ?? false,
        readTimeMin: data.readTimeMin ?? 5,
        sourceLocale: data.sourceLocale ?? "en",
        authorName: "Dr. Sarah Johnson",
        authorId: demoUserAdmin.id, // Assign admin as author
        categoryId: articleCat.id,
        translations: {
          create: [
            {
              locale: "en",
              title: data.titleEn,
              summary: data.summaryEn,
              content: data.contentEn,
            },
            {
              locale: "fr",
              title: data.titleFr,
              summary: data.summaryFr,
              content: data.contentFr,
            },
          ],
        },
        tags: {
          create: data.tags.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
    });

  await createArticle({
    slug: "10-science-backed-benefits-of-meditation",
    titleEn: "10 Science-Backed Benefits of Meditation",
    titleFr: "10 bienfaits de la méditation prouvés par la science",
    summaryEn:
      "An overview of meditation's effects on stress, sleep, and concentration backed by scientific research.",
    summaryFr:
      "Un tour d'horizon des effets de la méditation sur le stress, le sommeil et la concentration.",
    contentEn: "Scientific studies have shown that regular meditation practice can significantly improve mental and physical health. From reducing stress hormones to enhancing focus and promoting better sleep quality, the benefits are well-documented...",
    contentFr: "Des études scientifiques ont montré que la pratique régulière de la méditation peut considérablement améliorer la santé mentale et physique. De la réduction des hormones de stress à l'amélioration de la concentration en passant par une meilleure qualité de sommeil, les bienfaits sont bien documentés...",
    isFeatured: true,
    readTimeMin: 8,
    tags: ["meditation", "mental-health", "wellness"],
    sourceLocale: "en",
  });

  await createArticle({
    slug: "how-to-build-an-evening-routine",
    titleEn: "Building an Evening Routine That Calms the Mind",
    titleFr: "Construire une routine du soir qui apaise le mental",
    summaryEn:
      "A four-step method to gently disconnect at the end of the day.",
    summaryFr:
      "Une méthode en quatre étapes pour déconnecter doucement en fin de journée.",
    contentEn: "Creating a consistent evening routine helps signal to your body and mind that it's time to wind down. Start by setting a regular bedtime, dimming the lights, and avoiding screens at least an hour before sleep...",
    contentFr: "Créer une routine du soir cohérente aide à signaler à votre corps et votre esprit qu'il est temps de ralentir. Commencez par établir une heure de coucher régulière, tamisez les lumières et évitez les écrans au moins une heure avant de dormir...",
    readTimeMin: 6,
    tags: ["wellness", "mental-health"],
    sourceLocale: "en",
  });

  await prisma.resource.create({
    data: {
      slug: "mindfulspace-starter-guide",
      isFeatured: true,
      isPremium: true,
      readTimeMin: 5,
      sourceLocale: "fr",
      authorName: "Équipe MindfulSpace",
      authorId: demoUserAdmin.id,
      categoryId: guideCat.id,
      translations: {
        create: [
          {
            locale: "en",
            title: "MindfulSpace Starter Guide",
            summary: "Understand how to use MindfulSpace in 5 minutes...",
            content: "Welcome to MindfulSpace! This guide will help you get started with meditation, exercise tracking, and wellness resources. Begin by exploring the meditation library, track your daily habits, and discover educational content...",
          },
          {
            locale: "fr",
            title: "Guide de démarrage MindfulSpace",
            summary: "Comprendre en 5 minutes comment utiliser MindfulSpace...",
            content: "Bienvenue sur MindfulSpace ! Ce guide vous aidera à démarrer avec la méditation, le suivi d'exercices et les ressources de bien-être. Commencez par explorer la bibliothèque de méditations, suivez vos habitudes quotidiennes et découvrez du contenu éducatif...",
          },
        ],
      },
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
