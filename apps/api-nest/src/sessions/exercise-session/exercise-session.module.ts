// src/exercise-session/exercise-session.module.ts
import { Module } from '@nestjs/common';
import { ExerciseSessionService } from './exercise-session.service';
import { ExerciseSessionController } from './exercise-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadgesModule } from '@mindfulspace/api/badges/badges.module';

@Module({
  imports: [BadgesModule],
  controllers: [ExerciseSessionController],
  providers: [ExerciseSessionService, PrismaService],
})
export class ExerciseSessionModule {}
