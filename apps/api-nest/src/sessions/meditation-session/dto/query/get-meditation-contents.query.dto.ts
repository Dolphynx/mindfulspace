import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GetMeditationContentsQueryDto {
  @IsOptional()
  @IsString()
  meditationTypeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(60 * 60 * 3) // 3 heures max (ajuste)
  durationSeconds?: number;
}
