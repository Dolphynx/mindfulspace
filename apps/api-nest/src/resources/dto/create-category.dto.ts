import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO for creating a new resource category
 * Admin-only operation
 */
export class CreateCategoryDto {
  /**
   * Category display name in source locale (e.g., "Sommeil", "Stress Management")
   */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  /**
   * URL-friendly slug (must be unique)
   * Only lowercase letters, numbers, and hyphens
   */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  /**
   * Optional emoji icon for UI display
   */
  @IsString()
  @MaxLength(10)
  @IsOptional()
  iconEmoji?: string;

  /**
   * Source locale for the category (default: "fr")
   */
  @IsString()
  @IsOptional()
  sourceLocale?: string;
}
