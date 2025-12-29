import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO for creating a new resource tag
 * Admin-only operation
 */
export class CreateTagDto {
  /**
   * Tag display name in source locale (e.g., "Stress", "Mindfulness")
   */
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  /**
   * URL-friendly slug (must be unique)
   * Only lowercase letters, numbers, and hyphens
   */
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  /**
   * Source locale for the tag (default: "fr")
   */
  @IsString()
  @IsOptional()
  sourceLocale?: string;
}
