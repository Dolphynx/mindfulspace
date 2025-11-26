import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TestDataModule } from './test-data/test-data.module';
import { PrefsModule } from "./prefs/prefs.module";
import { TipsModule } from "./tips/tips.module";
import { AiModule } from './ai/ai.module';
import { SleepSessionModule } from './sessions/sleep-session/sleep-session.module';
import { MeditationSessionModule } from './sessions/meditation-session/meditation-session.module';
import { WorkoutSessionModule } from '@mindfulspace/api/sessions/workout-session/workout-session.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [PrefsModule, TipsModule,PrismaModule, TestDataModule, SleepSessionModule, MeditationSessionModule, WorkoutSessionModule, AiModule, ResourcesModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
