import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO (Data Transfer Object) pour les requêtes IA.
 *
 * → Utilisé pour le body des endpoints IA (theme optionnel).
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
}