/**
 * TipsController
 * --------------
 * Contrôleur HTTP pour les "astuces bien-être" de MindfulSpace.
 *
 * @remarks
 * Ce contrôleur a été mis en place lors d’une phase de prototypage afin
 * de tester l’exposition d’astuces bien-être via une API REST simple.
 *
 * L’objectif initial était de valider :
 * - la structure de l’API,
 * - la gestion de la locale,
 * - l’intégration côté frontend,
 * avant l’ajout éventuel d’une génération dynamique d’astuces
 * basée sur un service d’IA.
 *
 * La génération via IA n’a pas été implémentée dans cette version
 * du projet. Le contrôleur est conservé afin de :
 * - documenter les choix techniques explorés,
 * - maintenir une API fonctionnelle et cohérente,
 * - servir de point d’entrée si une évolution IA est ajoutée ultérieurement.
 *
 * Endpoint exposé (phase de test) :
 * - GET /tips/random → retourne une astuce aléatoire
 */

import { Controller, Get, Query } from '@nestjs/common';
import { TipsService } from './tips.service';
import { ApiTags, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from "../auth/decorators/public.decorator";

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
   * @remarks
   * Endpoint utilisé durant la phase de prototypage pour valider
   * la récupération d’astuces statiques côté frontend, en tenant
   * compte de la locale demandée.
   *
   * Paramètres :
   * - locale (query string, optionnelle) : ex. "fr", "en", "fr-BE".
   *   La locale est normalisée côté backend pour sélectionner
   *   la liste d’astuces appropriée.
   */
  @Public()
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
