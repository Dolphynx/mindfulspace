/**
 * PrismaService
 * -------------
 * Service qui étend PrismaClient pour l’intégrer proprement dans NestJS.
 *
 * Rôle :
 * - Ouvrir et fermer proprement la connexion à la DB lors du cycle de vie Nest.
 * - Exposer un helper `enableShutdownHooks` pour gérer l’arrêt gracieux de l’app.
 *
 * Avantages :
 * - Un seul client Prisma partagé dans toute l’appli.
 * - Intégration propre avec OnModuleInit / OnModuleDestroy.
 */

import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Appelé automatiquement par Nest lors de l’initialisation du module.
   * → Ouvre la connexion Prisma à la base de données.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Appelé automatiquement par Nest lors de la destruction du module.
   * → Ferme la connexion Prisma proprement.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Helper optionnel pour brancher les shutdown hooks de Nest sur Prisma.
   *
   * Usage typique :
   * - Appelé depuis main.ts après la création de l’app Nest :
   *     const prismaService = app.get(PrismaService);
   *     await prismaService.enableShutdownHooks(app);
   *
   * Cela permet à Nest d’appeler onModuleDestroy() lors de SIGINT/SIGTERM.
   */
  async enableShutdownHooks(app: INestApplication) {
    app.enableShutdownHooks(); // <- méthode Nest
  }
}
