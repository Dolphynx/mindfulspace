import { IsArray, IsString, ArrayMinSize, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for triggering automatic translation of a resource
 * Uses AI to translate resource content to target locales
 */
export class AutoTranslateDto {
  /**
   * Target locales to translate to
   * Example: ["en"] or ["en", "es", "de"]
   * Note: Source locale is automatically excluded
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(5, { each: true })
  targetLocales!: string[];
}
