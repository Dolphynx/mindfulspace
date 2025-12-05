import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TestDataModule } from './test-data/test-data.module';
import { PrefsModule } from "./prefs/prefs.module";
import { TipsModule } from "./tips/tips.module";
import { AiModule } from './ai/ai.module';
import { SleepSessionModule } from './sessions/sleep-session/sleep-session.module';
import { MeditationSessionModule } from './sessions/meditation-session/meditation-session.module';
import { WorkoutSessionModule } from '@mindfulspace/api/sessions/workout-session/workout-session.module';
import { ResourcesModule } from './resources/resources.module';
import { WorkoutProgramModule} from "@mindfulspace/api/programs/workout-program/workout-program.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrefsModule,
    TipsModule,
    PrismaModule,
    AuthModule,
    TestDataModule,
      SleepSessionModule,
      MeditationSessionModule,
      WorkoutSessionModule,
      WorkoutProgramModule,
    AiModule,
    ResourcesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
