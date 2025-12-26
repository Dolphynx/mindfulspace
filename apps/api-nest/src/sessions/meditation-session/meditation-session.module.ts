import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PrismaService } from "../../../prisma/prisma.service";
import { MeditationSessionService } from "./meditation-session.service";
import { SoundCloudResolverService } from "./soundcloud-resolver.service";

/**
 * Module des séances de méditation.
 *
 * @remarks
 * Déclare les providers nécessaires à la gestion des séances et des contenus,
 * ainsi que l’intégration SoundCloud via {@link SoundCloudResolverService}.
 */
@Module({
  imports: [HttpModule],
  providers: [PrismaService, MeditationSessionService, SoundCloudResolverService],
  exports: [MeditationSessionService],
})
export class MeditationSessionModule {}
