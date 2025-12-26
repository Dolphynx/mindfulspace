import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

/**
 * Query pour GET me/meditation-sessions
 *
 * Règles:
 * - Soit `lastDays` est fourni
 * - Soit `from` et `to` sont fournis ensemble
 * - Sinon, on peut laisser vide => fallback côté controller/service (ex: 7 jours)
 */
export class GetMeditationSessionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  lastDays?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  /**
   * Si `from` est fourni, `to` doit l'être aussi, et inversement.
   * (on fait la contrainte en 2 temps)
   */
  @ValidateIf((o) => o.from !== undefined)
  @IsDateString()
  toWhenFromProvided?: string; // champ technique pour déclencher validation (voir note ci-dessous)

  @ValidateIf((o) => o.to !== undefined)
  @IsDateString()
  fromWhenToProvided?: string;
}
