import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO for updating an existing resource category
 * All fields are optional - only provided fields will be updated
 * Admin-only operation
 */
export class UpdateCategoryDto {
  /**
   * Category display name
   */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

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
  @IsOptional()
  slug?: string;

  /**
   * Optional emoji icon for UI display
   */
  @IsString()
  @MaxLength(10)
  @IsOptional()
  iconEmoji?: string;
}
