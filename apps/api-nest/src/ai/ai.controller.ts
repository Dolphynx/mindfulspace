/**
 * AiController
 * ------------
 * Contrôleur responsable des endpoints liés aux fonctionnalités IA
 * (mantra, encouragement, objectifs).
 *
 * Il délègue toute la logique au AiService, qui lui-même s’occupe d'appeler
 * le moteur IA (LLM) configuré dans l’application.
 *
 * Swagger est utilisé pour :
 * - documenter les routes
 * - typer les DTO d’entrée et de sortie
 * - générer automatiquement l’interface dans /api/docs
 */

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateAiContentDto } from './dto/generate-ai-content.dto';
import {
  EncouragementResponseDto,
  MantraResponseDto,
  ObjectivesResponseDto,
} from './dto/ai-responses.dto';

/**
 * Le tag Swagger `"ai"` regroupe toutes les routes IA dans l’UI Swagger.
 */
@ApiTags('ai')
@Controller('ai') // Toutes les routes commencent par /ai
export class AiController {
  /**
   * Injection du service IA.
   * - Contient les appels aux modèles IA utilisés par l'application.
   */
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/mantra
   * ----------------
   * Génère un mini-mantra court et apaisant, basé sur un thème optionnel.
   *
   * Ex d’appel :
   *   {
   *     "theme": "stress"
   *   }
   *
   * Réponse :
   *   {
   *     "mantra": "Tu es en sécurité, tu avances pas à pas."
   *   }
   */
  @Post('mantra')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer un mini-mantra de méditation',
    description:
      'Retourne un mantra court, doux et apaisant, basé sur un thème optionnel (ex: "stress", "sommeil").',
  })
  @ApiBody({ type: GenerateAiContentDto, required: false })
  @ApiOkResponse({ type: MantraResponseDto })
  @ApiInternalServerErrorResponse({
    description: "Erreur lors de l'appel à l'IA ou configuration manquante.",
  })
  async generateMantra(
    @Body() body: GenerateAiContentDto,
  ): Promise<MantraResponseDto> {
    const mantra = await this.aiService.generateMantra(body.theme);
    return { mantra };
  }

  /**
   * POST /ai/encouragement
   * -----------------------
   * Génère un message court, positif et non culpabilisant.
   *
   * Ex :
   *   {
   *     "theme": "motivation"
   *   }
   *
   * Réponse :
   *   {
   *     "encouragement": "Tu avances même quand tu en doutes. Continue."
   *   }
   */
  @Post('encouragement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Générer un message d'encouragement",
    description:
      'Retourne un message court d\'encouragement, positif et non culpabilisant, basé sur un thème optionnel.',
  })
  @ApiBody({ type: GenerateAiContentDto, required: false })
  @ApiOkResponse({ type: EncouragementResponseDto })
  @ApiInternalServerErrorResponse({
    description: "Erreur lors de l'appel à l'IA ou configuration manquante.",
  })
  async generateEncouragement(
    @Body() body: GenerateAiContentDto,
  ): Promise<EncouragementResponseDto> {
    const encouragement = await this.aiService.generateEncouragement(body.theme);
    return { encouragement };
  }

  /**
   * POST /ai/objectives
   * --------------------
   * Génère trois objectifs personnalisés :
   * - facile
   * - normal
   * - ambitieux
   *
   * Contrairement aux autres endpoints, le thème est obligatoire.
   *
   * Ex attendu :
   *   {
   *     "theme": "gestion du stress"
   *   }
   *
   * Réponse :
   *   {
   *     "easy": "...",
   *     "normal": "...",
   *     "ambitious": "..."
   *   }
   */
  @Post('objectives')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer trois objectifs personnalisés',
    description:
      'Retourne trois objectifs basés sur un thème obligatoire (ex: "gestion du stress"), sous format JSON.',
  })
  @ApiBody({
    type: GenerateAiContentDto,
    required: true,
    description: 'Le champ "theme" est obligatoire pour ce endpoint.',
  })
  @ApiOkResponse({ type: ObjectivesResponseDto })
  @ApiBadRequestResponse({
    description: 'Requête invalide (par exemple thème manquant).',
  })
  @ApiInternalServerErrorResponse({
    description: "Erreur lors de l'appel à l'IA ou configuration manquante.",
  })
  async generateObjectives(
    @Body() body: GenerateAiContentDto,
  ): Promise<ObjectivesResponseDto> {
    return this.aiService.generateObjectives(body.theme ?? '');
  }
}
