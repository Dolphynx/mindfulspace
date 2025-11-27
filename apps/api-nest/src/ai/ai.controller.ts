/**
 * AiController
 * ------------
 * Contrôleur responsable des endpoints liés aux fonctionnalités IA.
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

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/mantra
   */
  @Post('mantra')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer un mini-mantra de méditation',
    description:
      'Retourne un mantra court, doux et apaisant, basé sur un thème optionnel (ex: "stress", "sommeil") et la locale.',
  })
  @ApiBody({ type: GenerateAiContentDto, required: false })
  @ApiOkResponse({ type: MantraResponseDto })
  @ApiInternalServerErrorResponse({
    description: "Erreur lors de l'appel à l'IA ou configuration manquante.",
  })
  async generateMantra(
    @Body() body: GenerateAiContentDto,
  ): Promise<MantraResponseDto> {
    const mantra = await this.aiService.generateMantra(body.theme, body.locale);
    return { mantra };
  }

  /**
   * POST /ai/encouragement
   */
  @Post('encouragement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Générer un message d'encouragement",
    description:
      'Retourne un message court d\'encouragement, positif et non culpabilisant, basé sur un thème optionnel et la locale.',
  })
  @ApiBody({ type: GenerateAiContentDto, required: false })
  @ApiOkResponse({ type: EncouragementResponseDto })
  @ApiInternalServerErrorResponse({
    description: "Erreur lors de l'appel à l'IA ou configuration manquante.",
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
   */
  @Post('objectives')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Générer trois objectifs personnalisés',
    description:
      'Retourne trois objectifs basés sur un thème obligatoire (ex: "gestion du stress") et une locale, sous format JSON.',
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
    return this.aiService.generateObjectives(body.theme ?? '', body.locale);
  }
}
