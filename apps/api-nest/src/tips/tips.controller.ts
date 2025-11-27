/**
 * TipsController
 * --------------
 * Contrôleur HTTP pour les "astuces bien-être" de MindfulSpace.
 *
 * Endpoint :
 * - GET /tips/random → retourne une astuce aléatoire sous la forme { tip: string }
 */

import { Controller, Get, Query } from '@nestjs/common';
import { TipsService } from './tips.service';
import { ApiTags, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('tips')
@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  /**
   * GET /tips/random
   * ----------------
   * Retourne une astuce aléatoire au format :
   *   { "tip": "Texte de l'astuce..." }
   *
   * Paramètres :
   * - locale (query string, optionnelle) : ex. "fr", "en", "fr-BE".
   */
  @Get('random')
  @ApiOkResponse({ description: 'Retourne une astuce aléatoire' })
  @ApiQuery({
    name: 'locale',
    required: false,
    description:
      'Locale souhaitée pour le tip (ex: "fr", "en", "fr-BE"). ' +
      'Le backend normalise en interne pour choisir la bonne liste.',
  })
  getRandomTip(@Query('locale') locale?: string) {
    const tip = this.tipsService.getRandomTip(locale);
    return { tip };
  }
}
