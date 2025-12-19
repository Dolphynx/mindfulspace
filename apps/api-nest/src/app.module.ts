import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrefsModule } from './prefs/prefs.module';
import { TipsModule } from './tips/tips.module';
import { AiModule } from './ai/ai.module';
import { SleepSessionModule } from './sessions/sleep-session/sleep-session.module';
import { MeditationSessionModule } from './sessions/meditation-session/meditation-session.module';
import { ExerciceSessionModule } from '@mindfulspace/api/sessions/exercice-session/exercice-session.module';
import { ResourcesModule } from './resources/resources.module';
import { ProgramsModule } from '@mindfulspace/api/programs/program.module';
import { BadgesModule } from './badges/badges.module';
import { WorldModule } from './world/world.module';

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
    SleepSessionModule,
    MeditationSessionModule,
    ExerciceSessionModule,
    ProgramsModule,
    AiModule,
    ResourcesModule,
    BadgesModule,
    WorldModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
