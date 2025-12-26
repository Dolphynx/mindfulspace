import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { MeditationSessionService } from "./meditation-session.service";
import { SoundCloudResolverService } from "./soundcloud-resolver.service";
import { BadgesModule } from "../../badges/badges.module";
import {
  MeditationSessionController
} from '@mindfulspace/api/sessions/meditation-session/meditation-session.controller';

/**
 * Module des séances de méditation.
 *
 * @remarks
 * Déclare les providers nécessaires à la gestion des séances et des contenus,
 * ainsi que l’intégration SoundCloud via {@link SoundCloudResolverService}.
 */
@Module({
  imports: [HttpModule, PrismaModule, BadgesModule],
  controllers: [MeditationSessionController],
  providers: [PrismaService, MeditationSessionService, SoundCloudResolverService],
  exports: [MeditationSessionService],
})
export class MeditationSessionModule {}
