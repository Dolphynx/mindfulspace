import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PrismaService } from "../../../prisma/prisma.service";
import { PrismaModule } from "../../../prisma/prisma.module";
import { BadgesModule } from "../../badges/badges.module";

import { MeditationSessionService } from "./meditation-session.service";
import { MeditationSessionController } from "@mindfulspace/api/sessions/meditation-session/meditation-session.controller";

import { MeditationAudioResolverService } from "./audio/meditation-audio-resolver.service";
import { AudiusResolverService } from "./audio/audius-resolver.service";
import { SoundCloudResolverService } from "./audio/soundcloud-resolver.service";
import { AudioStreamResolver } from "./audio/audio-stream-resolver.interface";

/**
 * Token d’injection pour fournir la liste des resolvers audio externes.
 *
 * @remarks
 * Permet d’injecter un tableau typé sans dépendre d’une implémentation concrète.
 */
export const AUDIO_STREAM_RESOLVERS = "AUDIO_STREAM_RESOLVERS";

/**
 * Module des séances de méditation.
 *
 * @remarks
 * Déclare les providers nécessaires à la gestion des séances et des contenus,
 * ainsi que la résolution multi-provider des médias audio :
 * - Audius (actif) ;
 * - SoundCloud (prévu, activable via configuration future).
 */
@Module({
  imports: [HttpModule, PrismaModule, BadgesModule],
  controllers: [MeditationSessionController],
  providers: [
    PrismaService,
    MeditationSessionService,

    /**
     * Resolvers concrets.
     */
    AudiusResolverService,
    SoundCloudResolverService,

    /**
     * Fournit un tableau de resolvers au service orchestrateur.
     */
    {
      provide: AUDIO_STREAM_RESOLVERS,
      useFactory: (
        audius: AudiusResolverService,
        soundcloud: SoundCloudResolverService,
      ): AudioStreamResolver[] => [audius, soundcloud],
      inject: [AudiusResolverService, SoundCloudResolverService],
    },

    /**
     * Orchestrateur de résolution audio.
     */
    {
      provide: MeditationAudioResolverService,
      useFactory: (resolvers: AudioStreamResolver[]) =>
        new MeditationAudioResolverService(resolvers),
      inject: [AUDIO_STREAM_RESOLVERS],
    },
  ],
  exports: [MeditationSessionService],
})
export class MeditationSessionModule {}
