import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { SleepService } from './sleep/sleep.service';
import { SleepController } from './sleep/sleep.controller';

@Module({
  imports: [],
  controllers: [AppController, HealthController, SleepController],
  providers: [AppService, SleepService],
})
export class AppModule {}
