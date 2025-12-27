import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for creating or updating a translation for a specific locale
 * Used to manually add/edit translations for a resource
 */
export class CreateTranslationDto {
  /**
   * Locale code for this translation
   * Example: "fr", "en", "es", "de"
   */
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  locale!: string;

  /**
   * Translated title
   * Example: "10 Science-Backed Benefits of Meditation"
   */
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  /**
   * Translated summary
   * Example: "An overview of the positive effects of meditation..."
   */
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary!: string;

  /**
   * Translated content (markdown or HTML)
   * Example: Full article content in target language
   */
  @IsString()
  @MinLength(50)
  content!: string;
}
