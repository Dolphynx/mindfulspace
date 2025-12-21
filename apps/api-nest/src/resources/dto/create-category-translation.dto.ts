import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for creating or updating a category translation for a specific locale
 * Used to manually add/edit translations for a resource category
 */
export class CreateCategoryTranslationDto {
  /**
   * Locale code for this translation
   * Example: "fr", "en", "es", "de"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  locale!: string;

  /**
   * Translated category name
   * Example: "Sleep", "Stress Management"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;
}
