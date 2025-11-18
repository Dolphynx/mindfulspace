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

@ApiTags('objectives')
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

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
