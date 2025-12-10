/**
 * PrefsController
 * ---------------
 * Contrôleur HTTP pour la gestion des préférences utilisateur MindfulSpace.
 *
 * Rôle :
 * - Exposer les endpoints REST pour lire et modifier les préférences.
 * - Actuellement : une seule préférence `launchBreathingOnStart`.
 *
 * Endpoints :
 * - GET  /prefs   → retourne l’état des préférences
 * - PATCH /prefs  → met à jour les préférences à partir d’un DTO
 */

import { Controller, Get, Patch, Body } from "@nestjs/common";
import { PrefsService } from "./prefs.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
import { UpdatePrefsDto } from "./dto/update-prefs.dto";
import { Public } from "../auth/decorators/public.decorator";

/**
 * Tag Swagger "prefs" : regroupe ces routes dans la doc Swagger.
 */
@Public()
@ApiTags("prefs")
@Controller("prefs")
export class PrefsController {
  /**
   * Injection du service des préférences.
   * - Toute la logique métier est déportée dans PrefsService.
   */
  constructor(private readonly prefsService: PrefsService) {}

  /**
   * GET /prefs
   * ----------
   * Renvoie l’état actuel des préférences utilisateur.
   *
   * Swagger :
   * - @ApiOkResponse documente la forme de la réponse.
   */
  @Get()
  @ApiOkResponse({
    description: "Renvoie les préférences utilisateur",
    schema: {
      example: {
        launchBreathingOnStart: true,
      },
    },
  })
  getPrefs() {
    return this.prefsService.getPrefs();
  }

  /**
   * PATCH /prefs
   * ------------
   * Met à jour les préférences utilisateur à partir d’un DTO.
   *
   * - Le body doit correspondre à UpdatePrefsDto.
   * - Retourne l’état complet des préférences après mise à jour.
   */
  @Patch()
  @ApiOkResponse({
    description: "Met à jour les préférences utilisateur et renvoie l’état complet",
    schema: {
      example: {
        launchBreathingOnStart: false,
      },
    },
  })
  updatePrefs(@Body() body: UpdatePrefsDto) {
    return this.prefsService.toggleLaunchBreathing(
      body.launchBreathingOnStart,
    );
  }
}
