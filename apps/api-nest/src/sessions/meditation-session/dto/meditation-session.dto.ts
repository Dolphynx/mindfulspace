import { IsInt, IsOptional, IsISO8601 } from 'class-validator';

export class CreateMeditationSessionDto {
  @IsInt()
  duration!: number;

  @IsOptional()
  @IsInt()
  quality?: number;

  @IsISO8601()
  dateSession!: string;
}
