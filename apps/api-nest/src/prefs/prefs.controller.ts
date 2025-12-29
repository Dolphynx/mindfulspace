/**
 * PrefsController
 * ---------------
 * Contrôleur HTTP pour la gestion des préférences utilisateur MindfulSpace.
 *
 * @remarks
 * Ce contrôleur a été mis en place lors d’une phase de prototypage afin
 * de tester l’exposition d’un système de préférences utilisateur via
 * une API REST (lecture et mise à jour).
 *
 * La fonctionnalité associée (préférences simulées, notamment le
 * lancement automatique d’une séance de respiration) a ensuite été
 * abandonnée, mais le contrôleur est conservé afin de :
 * - documenter les choix techniques explorés,
 * - maintenir la cohérence de l’API existante,
 * - servir de base si des préférences utilisateur sont réintroduites
 *   ultérieurement.
 *
 * Endpoints exposés (phase de test) :
 * - GET   /prefs  → retourne l’état courant des préférences simulées
 * - PATCH /prefs  → met à jour les préférences en mémoire
 */

import { Controller, Get, Patch, Body } from "@nestjs/common";
import { PrefsService } from "./prefs.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
import { UpdatePrefsDto } from "./dto/update-prefs.dto";
import { Public } from "../auth/decorators/public.decorator";

/**
 * Tag Swagger "prefs"
 *
 * @remarks
 * Utilisé pour regrouper ces routes dans la documentation Swagger,
 * principalement à des fins de démonstration et de validation API.
 */
@Public()
@ApiTags("prefs")
@Controller("prefs")
export class PrefsController {
  /**
   * Injection du service des préférences.
   *
   * @remarks
   * Toute la logique métier et l’état simulé des préférences sont
   * centralisés dans `PrefsService`.
   */
  constructor(private readonly prefsService: PrefsService) {}

  /**
   * GET /prefs
   * ----------
   * Retourne l’état actuel des préférences utilisateur.
   *
   * @remarks
   * Endpoint utilisé durant la phase de prototypage pour valider
   * la récupération de préférences simulées côté frontend.
   *
   * Swagger :
   * - @ApiOkResponse documente la forme de la réponse attendue.
   */
  @Get()
  @ApiOkResponse({
    description: "Renvoie les préférences utilisateur simulées",
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
   * @remarks
   * Endpoint utilisé lors des tests afin de simuler une modification
   * dynamique des préférences utilisateur, sans persistance en base
   * de données.
   *
   * @param body - Données de mise à jour conformes à `UpdatePrefsDto`.
   * @returns L’état complet des préférences après mise à jour.
   */
  @Patch()
  @ApiOkResponse({
    description: "Met à jour les préférences utilisateur simulées et renvoie l’état complet",
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
