import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SubscriptionRequestStatus } from '@prisma/client';

export class ReviewSubscriptionRequestDto {
  @IsEnum(SubscriptionRequestStatus)
  status!: SubscriptionRequestStatus; // APPROVED or REJECTED

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
