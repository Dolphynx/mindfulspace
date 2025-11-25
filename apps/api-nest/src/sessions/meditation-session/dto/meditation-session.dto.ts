import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import { MeditationSessionSource } from '@prisma/client';

export class CreateMeditationSessionDto {
  // 👇 on ne le prend plus dans le body
  // @IsString()
  // userId!: string; // TODO: plus tard, récupérer depuis l'auth et ne plus le mettre dans le body

  @IsOptional()
  @IsEnum(MeditationSessionSource)
  source?: MeditationSessionSource; // par défaut: MANUAL

  @IsString()
  meditationTypeId!: string;

  @IsOptional()
  @IsString()
  meditationContentId?: string;

  @IsISO8601()
  dateSession!: string;

  @IsInt()
  @Min(1)
  durationSeconds!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodBefore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodAfter?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
