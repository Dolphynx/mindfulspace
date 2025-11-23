import { Module } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { MeditationSessionController } from './meditation-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [MeditationSessionController],
  providers: [MeditationSessionService, PrismaService],
})
export class MeditationSessionModule {}
