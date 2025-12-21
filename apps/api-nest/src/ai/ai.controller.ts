/**
 * AiController
 * ------------
 * Contrôleur HTTP responsable des fonctionnalités basées sur l’IA.
 *
 * Ce contrôleur expose plusieurs endpoints publics permettant de générer
 * des contenus courts et bienveillants (mantras, encouragements, objectifs)
 * à destination du frontend MindfulSpace.
 *
 * Caractéristiques :
 * - Endpoints publics (pas d’authentification requise).
 * - Communication avec un service IA externe via AiService.
 * - Réponses JSON simples, typées et documentées via Swagger.
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
import { Public } from '@mindfulspace/api/auth/decorators/public.decorator';

/**
 * Contrôleur des endpoints IA.
 *
 * @remarks
 * - Le décorateur `@Public()` rend l’ensemble des routes accessibles
 *   sans jeton JWT.
 * - Le préfixe de route est `/ai`.
 */
@Public()
@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/mantra
   * ----------------
   * Génère un mini-mantra de méditation.
   *
   * Le mantra est volontairement :
   * - court,
   * - apaisant,
   * - non prescriptif,
   * - adapté à la locale fournie.
   *
   * Le thème est optionnel (ex. : "stress", "sommeil").
   */
  @Post('mantra')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer un mini-mantra de méditation',
    description:
      'Retourne un mantra court, doux et apaisant, basé sur un thème optionnel ' +
      '(ex: "stress", "sommeil") et la locale.',
  })
  @ApiBody({
    type: GenerateAiContentDto,
    required: false,
    description:
      'Corps optionnel. Peut contenir un thème et/ou une locale pour orienter la génération.',
  })
  @ApiOkResponse({
    type: MantraResponseDto,
    description: 'Mantra généré avec succès.',
  })
  @ApiInternalServerErrorResponse({
    description:
      "Erreur lors de l'appel au fournisseur IA ou configuration manquante.",
  })
  async generateMantra(
    @Body() body: GenerateAiContentDto,
  ): Promise<MantraResponseDto> {
    const mantra = await this.aiService.generateMantra(body.theme, body.locale);
    return { mantra };
  }

  /**
   * POST /ai/encouragement
   * ----------------------
   * Génère un message d’encouragement personnalisé.
   *
   * Le message est conçu pour être :
   * - positif,
   * - bienveillant,
   * - non culpabilisant,
   * - court et facilement lisible.
   *
   * Le thème et la locale sont optionnels.
   */
  @Post('encouragement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Générer un message d'encouragement",
    description:
      'Retourne un message court d’encouragement, positif et non culpabilisant, ' +
      'basé sur un thème optionnel et la locale.',
  })
  @ApiBody({
    type: GenerateAiContentDto,
    required: false,
    description:
      'Corps optionnel. Peut contenir un thème et/ou une locale pour orienter le message.',
  })
  @ApiOkResponse({
    type: EncouragementResponseDto,
    description: "Message d'encouragement généré avec succès.",
  })
  @ApiInternalServerErrorResponse({
    description:
      "Erreur lors de l'appel au fournisseur IA ou configuration manquante.",
  })
  async generateEncouragement(
    @Body() body: GenerateAiContentDto,
  ): Promise<EncouragementResponseDto> {
    const encouragement = await this.aiService.generateEncouragement(
      body.theme,
      body.locale,
    );
    return { encouragement };
  }

  /**
   * POST /ai/objectives
   * -------------------
   * Génère trois objectifs personnalisés.
   *
   * Contrairement aux autres endpoints IA :
   * - le thème est obligatoire,
   * - la réponse contient une structure JSON avec plusieurs objectifs.
   *
   * Exemple de thème : "gestion du stress", "équilibre vie pro / perso".
   */
  @Post('objectives')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer trois objectifs personnalisés',
    description:
      'Retourne trois objectifs basés sur un thème obligatoire ' +
      '(ex: "gestion du stress") et une locale, sous format JSON.',
  })
  @ApiBody({
    type: GenerateAiContentDto,
    required: true,
    description:
      'Le champ "theme" est obligatoire pour ce endpoint. ' +
      'La locale reste optionnelle.',
  })
  @ApiOkResponse({
    type: ObjectivesResponseDto,
    description: 'Objectifs générés avec succès.',
  })
  @ApiBadRequestResponse({
    description: 'Requête invalide (par exemple thème manquant).',
  })
  @ApiInternalServerErrorResponse({
    description:
      "Erreur lors de l'appel au fournisseur IA ou configuration manquante.",
  })
  async generateObjectives(
    @Body() body: GenerateAiContentDto,
  ): Promise<ObjectivesResponseDto> {
    return this.aiService.generateObjectives(body.theme ?? '', body.locale);
  }

  /**
   * POST /ai/translate-text
   * -----------------------
   * Translates text from one language to another using AI.
   *
   * This endpoint is used by the resource creation wizard to translate
   * resource content fields (title, summary, content) to target locales.
   *
   * @param body - Contains text, sourceLocale, and targetLocale
   * @returns Translated text
   */
  @Post('translate-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate text using AI',
    description:
      'Translates text from source language to target language using AI. ' +
      'Preserves formatting and maintains tone.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to translate',
          example: 'Méditation guidée pour débutants',
        },
        sourceLocale: {
          type: 'string',
          description: 'Source language code (e.g., "fr", "en")',
          example: 'fr',
        },
        targetLocale: {
          type: 'string',
          description: 'Target language code (e.g., "en", "fr")',
          example: 'en',
        },
      },
      required: ['text', 'sourceLocale', 'targetLocale'],
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        translatedText: {
          type: 'string',
          description: 'The translated text',
          example: 'Guided meditation for beginners',
        },
      },
    },
    description: 'Text translated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request (missing required fields).',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error calling AI provider or configuration missing.',
  })
  async translateText(
    @Body()
    body: {
      text: string;
      sourceLocale: string;
      targetLocale: string;
    },
  ): Promise<{ translatedText: string }> {
    const translatedText = await this.aiService.translateText(
      body.text,
      body.sourceLocale,
      body.targetLocale,
    );
    return { translatedText };
  }
}
