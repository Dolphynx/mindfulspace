import { IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { SubscriptionRequestType, CoachTier } from '@prisma/client';

export class CreateSubscriptionRequestDto {
  @IsEnum(SubscriptionRequestType)
  requestType!: SubscriptionRequestType;

  @ValidateIf((o) => o.requestType === SubscriptionRequestType.COACH)
  @IsEnum(CoachTier)
  coachTier?: CoachTier;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivation?: string;

  @ValidateIf((o) => o.requestType === SubscriptionRequestType.COACH)
  @IsString()
  @MaxLength(2000)
  experience?: string;
}
