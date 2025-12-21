import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";
import { ERRORS } from "../../common/errors/errors";

/**
 * DTO de query pour les endpoints badges utilisant `limit`.
 */
export class BadgesLimitQueryDto {
  /**
   * Nombre maximum d'éléments à retourner.
   *
   * @remarks
   * - Doit être un entier positif
   * - Les bornes finales sont appliquées côté service via `clampLimit`
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ERRORS.POSITIVE_INT("limit") })
  @Min(1, { message: ERRORS.POSITIVE_INT("limit") })
  limit?: number;
}
