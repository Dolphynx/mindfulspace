import { IsEnum, IsOptional } from 'class-validator';
import { SubscriptionRequestType, SubscriptionRequestStatus } from '@prisma/client';

export class QuerySubscriptionRequestsDto {
  @IsOptional()
  @IsEnum(SubscriptionRequestStatus)
  status?: SubscriptionRequestStatus;

  @IsOptional()
  @IsEnum(SubscriptionRequestType)
  requestType?: SubscriptionRequestType;
}
