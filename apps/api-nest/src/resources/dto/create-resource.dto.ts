import {
  IsString,
  IsEnum,
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
import { ResourceType } from '@prisma/client';

/**
 * DTO for creating a new resource
 * Used by coaches and admins to create articles, videos, guides, etc.
 */
export class CreateResourceDto {
  /**
   * Resource title (editorial)
   * Example: "10 bienfaits de la méditation prouvés par la science"
   */
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  /**
   * URL-friendly slug (must be unique)
   * Example: "10-science-backed-benefits-of-meditation"
   * Only lowercase letters, numbers, and hyphens
   */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  /**
   * Short summary/teaser (shown in resource cards)
   * Example: "Un tour d'horizon des effets positifs de la méditation..."
   */
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary!: string;

  /**
   * Full content (markdown or HTML)
   * Will be sanitized on the backend before storage
   */
  @IsString()
  @MinLength(50)
  content!: string;

  /**
   * Resource type (ARTICLE, VIDEO, GUIDE, MEDITATION_PROGRAM, EXERCICE_PROGRAM)
   */
  @IsEnum(ResourceType)
  type!: ResourceType;

  /**
   * Whether this resource requires premium subscription
   * Default: false (accessible to all users)
   */
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  /**
   * Whether this resource should be featured on the homepage
   * Only admins can set this to true (enforced in service layer)
   * Default: false
   */
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  /**
   * Author name (optional, for attribution)
   * Example: "Dr. Sarah Johnson"
   * Note: authorId (creator) is automatically set from JWT token
   */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  authorName?: string;

  /**
   * Estimated read time in minutes
   * Example: 8 (for an 8-minute read)
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  readTimeMin?: number;

  /**
   * External URL (for videos, external articles, etc.)
   * Example: "https://youtu.be/abc123"
   */
  @IsUrl()
  @IsOptional()
  externalUrl?: string;

  /**
   * Category UUID (required)
   * Must reference an existing ResourceCategory
   */
  @IsUUID('4')
  categoryId!: string;

  /**
   * Array of tag UUIDs (optional)
   * Must reference existing ResourceTag entries
   * Example: ["uuid-1", "uuid-2", "uuid-3"]
   */
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  /**
   * Optional link to a meditation program
   * Must reference an existing MeditationProgram
   */
  @IsUUID('4')
  @IsOptional()
  meditationProgramId?: string;
}
