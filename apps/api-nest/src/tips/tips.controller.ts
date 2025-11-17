/**
 * TipsController
 * --------------
 * Contrôleur HTTP pour les "astuces bien-être" de MindfulSpace.
 *
 * Rôle :
 * - Exposer un endpoint REST pour récupérer une astuce aléatoire.
 *
 * Endpoint :
 * - GET /tips/random → retourne une astuce aléatoire sous la forme { tip: string }
 */

import { Controller, Get } from "@nestjs/common";
import { TipsService } from "./tips.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";

/**
 * Tag Swagger "tips" :
 * - Permet de regrouper ces routes dans la doc Swagger (onglet "tips").
 */
@ApiTags("tips")
@Controller("tips") // Toutes les routes seront préfixées par /tips
export class TipsController {
  /**
   * Injection du service TipsService.
   * - Toute la logique métier (choix d’une astuce) est déléguée au service.
   */
  constructor(private readonly tipsService: TipsService) {}

  /**
   * GET /tips/random
   * ----------------
   * Retourne une astuce aléatoire au format :
   *   { "tip": "Texte de l'astuce..." }
   *
   * Cette route est utilisée côté front pour afficher une "astuce du jour"
   * ou un conseil ponctuel.
   */
  @Get("random")
  @ApiOkResponse({ description: "Retourne une astuce aléatoire" })
  getRandomTip() {
    const tip = this.tipsService.getRandomTip();
    return { tip };
  }
}
