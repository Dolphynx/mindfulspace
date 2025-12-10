// sleep-session.module.ts
import { Module } from '@nestjs/common';
import { SleepSessionService } from './sleep-session.service';
import { SleepSessionController } from './sleep-session.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadgesModule } from '@mindfulspace/api/badges/badges.module';

@Module({
  imports: [BadgesModule],
  controllers: [SleepSessionController],
  providers: [SleepSessionService, PrismaService],
})
export class SleepSessionModule {}
