import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // petit helper optionnel pour activer la fermeture gracieuse de l'app
  async enableShutdownHooks(app: INestApplication) {
    app.enableShutdownHooks(); // <- méthode Nest
  }
}
