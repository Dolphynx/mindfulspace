import { Module } from '@nestjs/common';
import { WorkoutProgramService } from './workout-program.service';
import { WorkoutProgramController } from './workout-program.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
    controllers: [WorkoutProgramController],
    providers: [WorkoutProgramService, PrismaService],
})
export class WorkoutProgramModule {}
