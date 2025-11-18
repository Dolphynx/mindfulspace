/**
 * PrismaModule
 * ------------
 * Module global NestJS qui expose PrismaService à toute l’application.
 *
 * Rôle :
 * - Fournir une instance unique de PrismaClient (via PrismaService).
 * - Éviter d’avoir à importer le module dans chaque feature module grâce à `@Global()`.
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // → rend ce module accessible partout sans devoir l’importer explicitement
@Module({
  providers: [PrismaService], // PrismaService instancie et configure PrismaClient
  exports: [PrismaService],   // Permet aux autres modules d’injecter PrismaService
})
export class PrismaModule {}
