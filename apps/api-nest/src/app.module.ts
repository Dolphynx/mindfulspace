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
import { SessionsModule } from './sessions/sessions.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { ResourcesModule } from './resources/resources.module';

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
    SessionsModule,
    AiModule,
    ObjectivesModule,
    ResourcesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
