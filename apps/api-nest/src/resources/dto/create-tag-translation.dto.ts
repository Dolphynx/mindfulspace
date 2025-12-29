import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for creating or updating a tag translation for a specific locale
 * Used to manually add/edit translations for a resource tag
 */
export class CreateTagTranslationDto {
  /**
   * Locale code for this translation
   * Example: "fr", "en", "es", "de"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  locale!: string;

  /**
   * Translated tag name
   * Example: "stress", "relaxation", "mindfulness"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;
}
