import { IsDateString, IsOptional } from "class-validator";

export class GetDailySummaryQueryDto {
  /**
   * Date au format YYYY-MM-DD
   */
  @IsOptional()
  @IsDateString()
  date?: string;
}
