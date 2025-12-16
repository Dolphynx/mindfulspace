import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MeditationSessionService } from './meditation-session.service';
import { MeditationSessionController } from './meditation-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadgesModule } from '@mindfulspace/api/badges/badges.module';

/**
 * Module encapsulant toute la logique métier et les endpoints liés
 * aux séances de méditation.
 *
 * Il déclare :
 * - un contrôleur HTTP (`MeditationSessionController`)
 * - un service métier (`MeditationSessionService`)
 * - le service Prisma permettant l’accès à la base de données
 *
 * Ce module peut être importé dans un module de domaine plus large
 * (ex. `MeditationModule`) ou directement dans `AppModule`.
 *
 * Structure attendue par Swagger :
 * - Les décorateurs Swagger se trouvent dans le controller, pas dans le module.
 * - Le module assure simplement la cohésion et l’injection de dépendances.
 */
@Module({
  imports: [BadgesModule, HttpModule],
  controllers: [MeditationSessionController],
  providers: [MeditationSessionService, PrismaService],
})
export class MeditationSessionModule {}
