// src/workout-session/workout-session.module.ts
import { Module } from '@nestjs/common';
import { WorkoutSessionService } from './workout-session.service';
import { WorkoutSessionController } from './workout-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [WorkoutSessionController],
  providers: [WorkoutSessionService, PrismaService],
})
export class WorkoutSessionModule {}
