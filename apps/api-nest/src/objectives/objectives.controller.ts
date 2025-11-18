/**
 * ObjectivesController
 * --------------------
 * Ce contrôleur expose toutes les routes HTTP liées aux objectifs
 * pour l’utilisateur de démonstration.
 *
 * Rôles :
 * - Fournir l'accès aux objectifs existants
 * - Indiquer si le user de démo possède déjà des sessions encodées
 * - Générer une proposition d’objectifs (easy / normal / challenge)
 * - Enregistrer un objectif sélectionné par le front
 *
 * Toute la logique métier est déléguée à `ObjectivesService`.
 * Ce contrôleur sert uniquement d’interface HTTP + Swagger docs.
 */

import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectivesService } from './objectives.service';
import type { ObjectiveLevel } from './objectives.types';

/**
 * Le tag Swagger "objectives" regroupe toutes les routes dans Swagger UI.
 * Le contrôleur répond sous /objectives.
 */
@ApiTags('objectives')
@Controller('objectives')
export class ObjectivesController {
  /**
   * Injection du ObjectivesService.
   * --------------------------------
   * Le contrôleur ne fait aucune logique métier : il délègue tout
   * au service et ne fait que gérer :
   * - la structure des endpoints
   * - les DTO / paramètres
   * - la documentation Swagger
   */
  constructor(private readonly objectivesService: ObjectivesService) {}

  /**
   * GET /objectives
   * ----------------
   * Retourne la liste complète des objectifs pour le user de démo.
   * Utilisé pour l'affichage dans la page Objectifs.
   */
  @Get()
  @ApiOperation({
    summary: "Liste les objectifs du user de démo",
    description:
      'Retourne tous les objectifs encodés pour le user de démonstration, utilisés par la page Objectifs.',
  })
  @ApiOkResponse({
    description: 'Liste des objectifs',
  })
  async getObjectivesForDemoUser() {
    return this.objectivesService.getObjectivesForDemoUser();
  }

  /**
   * GET /objectives/has-sessions
   * ----------------------------
   * Vérifie si le user de démo possède au moins une session encodée.
   *
   * Utile pour le front :
   * - si false → afficher un message "aucune session" + désactiver les formulaires
   * - si true  → le front peut appeler l'API de proposition d’objectifs
   */
  @Get('has-sessions')
  @ApiOperation({
    summary: 'Indique si le user de démo possède au moins une session',
    description:
      'Permet au front de savoir si on peut calculer des objectifs ou afficher un message expliquant qu’aucune session n’a encore été encodée.',
  })
  @ApiOkResponse({
    description: 'Retourne { hasSessions: boolean }',
    schema: {
      type: 'object',
      properties: {
        hasSessions: { type: 'boolean' },
      },
    },
  })
  async hasSessions() {
    return this.objectivesService.hasSessionsForDemoUser();
  }

  /**
   * POST /objectives/propose
   * -------------------------
   * Génère une proposition d’objectifs basée sur les sessions récentes.
   *
   * Corps attendu :
   * {
   *   "sessionTypeId": "id-du-type-de-session"
   * }
   *
   * Retour :
   * - moyenne calculée
   * - unité et nom du type de session
   * - les trois propositions :
   *   easy / normal / challenge
   *
   * Gestion d’erreurs :
   * - 400 si sessionTypeId manquant
   * - 404 si :
   *     - user de démo introuvable
   *     - type de session inexistant
   *     - aucune session récente pour ce type
   */
  @Post('propose')
  @ApiOperation({
    summary: 'Propose des objectifs à partir des sessions récentes',
  })
  @ApiOkResponse({
    description: 'Proposition easy / normal / challenge',
  })
  @ApiBadRequestResponse({ description: 'sessionTypeId manquant ou invalide' })
  @ApiNotFoundResponse({
    description:
      'User de démo, type de session ou sessions manquants pour la période donnée',
  })
  async proposeForSessionType(
    @Body('sessionTypeId') sessionTypeId: string,
  ) {
    return this.objectivesService.proposeForSessionType(sessionTypeId);
  }

  /**
   * POST /objectives/save
   * ----------------------
   * Enregistre un objectif à partir d'un niveau sélectionné.
   *
   * Corps attendu :
   * {
   *   "sessionTypeId": "id",
   *   "level": "easy" | "normal" | "challenge"
   * }
   *
   * Le service :
   * - recalcule d'abord la proposition (pour être sûr qu'elle est à jour)
   * - sélectionne la bonne valeur selon le niveau
   * - crée l'objectif en base
   *
   * Gestion d’erreurs :
   * - 400 si un paramètre est invalide/manquant
   * - 500 si une erreur inattendue arrive (ex: problème DB)
   */
  @Post('save')
  @ApiOperation({
    summary:
      'Enregistre un objectif basé sur un niveau (easy/normal/challenge)',
  })
  @ApiOkResponse({
    description: 'Objectif créé',
  })
  @ApiBadRequestResponse({
    description: 'Paramètres manquants ou invalides',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur inattendue lors de la création de l’objectif',
  })
  async saveObjectiveFromLevel(
    @Body('sessionTypeId') sessionTypeId: string,
    @Body('level') level: ObjectiveLevel,
  ) {
    return this.objectivesService.saveObjectiveFromLevel(
      sessionTypeId,
      level,
    );
  }
}
