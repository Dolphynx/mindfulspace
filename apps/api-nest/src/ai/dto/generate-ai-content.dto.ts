import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO (Data Transfer Object) pour les requêtes IA.
 *
 * → Utilisé pour le body des endpoints IA (theme + locale optionnels).
 * → Sert aussi à générer la doc Swagger (types explicites).
 */
export class GenerateAiContentDto {
  @ApiPropertyOptional({
    description:
      'Thème ou contexte facultatif (ex: "stress", "concentration", "sommeil"). ' +
      'Permet à l’IA de personnaliser le contenu.',
    example: 'gestion du stress',
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({
    description:
      'Locale souhaitée pour la réponse IA (ex: "fr", "en", "nl-BE"). ' +
      'La logique interne de l’IA utilise ce code pour choisir la langue de génération.',
    example: 'fr',
  })
  @IsOptional()
  @IsString()
  locale?: string;
}
