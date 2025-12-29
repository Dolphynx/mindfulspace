import { Module } from '@nestjs/common';
import { SubscriptionRequestsController } from './subscription-requests.controller';
import { SubscriptionRequestsService } from './subscription-requests.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionRequestsController],
  providers: [SubscriptionRequestsService],
  exports: [SubscriptionRequestsService],
})
export class SubscriptionRequestsModule {}
