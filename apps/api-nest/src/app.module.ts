import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TestDataModule } from './test-data/test-data.module';
import { PrefsModule } from "./prefs/prefs.module";
import { TipsModule } from "./tips/tips.module";
import { AiModule } from './ai/ai.module';
import { SessionsModule } from '@mindfulspace/api/sessions/sessions.module';

@Module({
  imports: [PrefsModule, TipsModule,PrismaModule, TestDataModule, SessionsModule, AiModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
