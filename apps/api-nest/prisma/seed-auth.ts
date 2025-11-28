/**
 * Authentication Seed Script
 * --------------------------
 * This script seeds the database with default roles and permissions
 * for the authentication system.
 *
 * Run with: pnpm --filter api db:seed:auth
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding authentication data...');

  // ===========================
  // 1. Create Permissions
  // ===========================
  console.log('📝 Creating permissions...');

  const permissions = [
    // User permissions
    { name: 'users:read', description: 'Read user profiles' },
    { name: 'users:update', description: 'Update user profiles' },
    { name: 'users:delete', description: 'Delete users' },
    { name: 'users:manage', description: 'Full user management' },

    // Session permissions
    { name: 'sessions:create', description: 'Create sessions' },
    { name: 'sessions:read', description: 'Read sessions' },
    { name: 'sessions:update', description: 'Update sessions' },
    { name: 'sessions:delete', description: 'Delete sessions' },

    // Objective permissions
    { name: 'objectives:create', description: 'Create objectives' },
    { name: 'objectives:read', description: 'Read objectives' },
    { name: 'objectives:update', description: 'Update objectives' },
    { name: 'objectives:delete', description: 'Delete objectives' },

    // Resource permissions
    { name: 'resources:create', description: 'Create resources' },
    { name: 'resources:read', description: 'Read resources' },
    { name: 'resources:update', description: 'Update resources' },
    { name: 'resources:delete', description: 'Delete resources' },

    // Admin permissions
    { name: 'admin:access', description: 'Access admin panel' },
    { name: 'admin:manage', description: 'Full admin privileges' },

    // Premium content
    { name: 'premium:access', description: 'Access premium content' },

    // Coach permissions
    { name: 'coach:access', description: 'Access coach features' },
    { name: 'coach:manage-clients', description: 'Manage client sessions' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // ===========================
  // 2. Create Roles
  // ===========================
  console.log('🎭 Creating roles...');

  // User role (default)
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic permissions',
    },
  });

  // Premium role
  const premiumRole = await prisma.role.upsert({
    where: { name: 'premium' },
    update: {},
    create: {
      name: 'premium',
      description: 'Premium user with access to exclusive content',
    },
  });

  // Coach role
  const coachRole = await prisma.role.upsert({
    where: { name: 'coach' },
    update: {},
    create: {
      name: 'coach',
      description: 'Coach with ability to manage clients',
    },
  });

  // Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full system access',
    },
  });

  console.log('✅ Created 4 roles: user, premium, coach, admin');

  // ===========================
  // 3. Assign Permissions to Roles
  // ===========================
  console.log('🔗 Assigning permissions to roles...');

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  const getPermissionId = (name: string) =>
    allPermissions.find((p) => p.name === name)?.id || '';

  // User permissions (basic access)
  const userPermissions = [
    'sessions:create',
    'sessions:read',
    'sessions:update',
    'sessions:delete',
    'objectives:create',
    'objectives:read',
    'objectives:update',
    'objectives:delete',
    'resources:read',
    'users:read',
    'users:update',
  ];

  for (const permName of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: getPermissionId(permName),
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: getPermissionId(permName),
      },
    });
  }

  // Premium permissions (user + premium access)
  const premiumPermissions = [...userPermissions, 'premium:access'];

  for (const permName of premiumPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: premiumRole.id,
          permissionId: getPermissionId(permName),
        },
      },
      update: {},
      create: {
        roleId: premiumRole.id,
        permissionId: getPermissionId(permName),
      },
    });
  }

  // Coach permissions (premium + coach features)
  const coachPermissions = [
    ...premiumPermissions,
    'coach:access',
    'coach:manage-clients',
    'resources:create',
    'resources:update',
  ];

  for (const permName of coachPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: coachRole.id,
          permissionId: getPermissionId(permName),
        },
      },
      update: {},
      create: {
        roleId: coachRole.id,
        permissionId: getPermissionId(permName),
      },
    });
  }

  // Admin permissions (all permissions)
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

  console.log('✅ Assigned permissions to all roles');

  // ===========================
  // 4. Create Demo Users for Each Role
  // ===========================
  console.log('👥 Creating demo users...');

  // Hash password using Argon2id (same as production auth service)
  const demoPassword = 'Demo123!'; // Same password for all demo users
  const hashedPassword = await argon2.hash(demoPassword, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });

  // Regular User
  const demoUserRegular = await prisma.user.upsert({
    where: { email: 'user@mindfulspace.app' },
    update: {},
    create: {
      email: 'user@mindfulspace.app',
      displayName: 'Demo User',
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

  console.log('  ✅ Created user@mindfulspace.app (role: user)');

  // Premium User
  const demoUserPremium = await prisma.user.upsert({
    where: { email: 'premium@mindfulspace.app' },
    update: {},
    create: {
      email: 'premium@mindfulspace.app',
      displayName: 'Demo Premium User',
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

  console.log('  ✅ Created premium@mindfulspace.app (role: premium)');

  // Coach User
  const demoUserCoach = await prisma.user.upsert({
    where: { email: 'coach@mindfulspace.app' },
    update: {},
    create: {
      email: 'coach@mindfulspace.app',
      displayName: 'Demo Coach',
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

  console.log('  ✅ Created coach@mindfulspace.app (role: coach)');

  // Admin User
  const demoUserAdmin = await prisma.user.upsert({
    where: { email: 'admin@mindfulspace.app' },
    update: {},
    create: {
      email: 'admin@mindfulspace.app',
      displayName: 'Demo Admin',
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

  console.log('  ✅ Created admin@mindfulspace.app (role: admin)');

  // ===========================
  // Summary
  // ===========================
  console.log('\n📊 Seed Summary:');
  console.log('  • Roles: user, premium, coach, admin');
  console.log('  • Permissions: ', allPermissions.length);
  console.log('  • Demo Users (all with password: Demo123!):');
  console.log('    - user@mindfulspace.app (role: user)');
  console.log('    - premium@mindfulspace.app (role: premium)');
  console.log('    - coach@mindfulspace.app (role: coach)');
  console.log('    - admin@mindfulspace.app (role: admin)');
  console.log('\n✅ Authentication seed completed successfully!');
  console.log('✅ All passwords are properly hashed with Argon2id');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
