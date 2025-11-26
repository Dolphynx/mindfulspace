// sleep-session.dto.ts
import { IsInt, IsOptional, IsISO8601 } from 'class-validator';

export class CreateSleepSessionDto {
  @IsInt()
  hours!: number;

  @IsOptional()
  @IsInt()
  quality?: number;

  @IsISO8601()
  dateSession!: string;
}

