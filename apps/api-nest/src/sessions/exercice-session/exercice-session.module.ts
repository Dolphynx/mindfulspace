// src/exercice-session/exercice-session.module.ts
import { Module } from '@nestjs/common';
import { ExerciceSessionService } from './exercice-session.service';
import { ExerciceSessionController } from './exercice-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ExerciceSessionController],
  providers: [ExerciceSessionService, PrismaService],
})
export class ExerciceSessionModule {}
