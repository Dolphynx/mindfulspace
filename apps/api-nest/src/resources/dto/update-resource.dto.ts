import {
  IsString,
  IsBoolean,
  IsInt,
  IsUrl,
  IsUUID,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsPositive,
} from 'class-validator';

/**
 * DTO for updating an existing resource
 * All fields are optional - only provided fields will be updated
 * Used by resource owners and admins
 */
export class UpdateResourceDto {
  /**
   * Resource title (editorial)
   */
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  /**
   * URL-friendly slug (must be unique)
   * Only lowercase letters, numbers, and hyphens
   */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  @IsOptional()
  slug?: string;

  /**
   * Short summary/teaser
   */
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsOptional()
  summary?: string;

  /**
   * Full content (markdown or HTML)
   */
  @IsString()
  @MinLength(50)
  @IsOptional()
  content?: string;

  /**
   * Whether this resource requires premium subscription
   */
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  /**
   * Whether this resource should be featured on the homepage
   * Only admins can modify this field (enforced in service layer)
   */
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  /**
   * Author name (for attribution)
   */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  authorName?: string;

  /**
   * Estimated read time in minutes
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  readTimeMin?: number;

  /**
   * External URL (for videos, external articles, etc.)
   */
  @IsUrl()
  @IsOptional()
  externalUrl?: string;

  /**
   * Category UUID
   */
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  /**
   * Array of tag UUIDs
   * Replaces existing tags (not additive)
   */
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  /**
   * Optional link to a meditation program
   */
  @IsUUID('4')
  @IsOptional()
  meditationProgramId?: string;
}
