import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';

/**
 * Contrôleur HTTP exposant les endpoints liés aux séances de méditation.
 *
 * Ce contrôleur fournit :
 * - POST `/meditation` : création d’une nouvelle séance
 * - GET  `/meditation` : récupération de toutes les séances (usage interne / debug)
 * - GET  `/meditation/last7days` : résumé des 7 derniers jours
 * - GET  `/meditation/summary/yesterday` : résumé d’hier
 * - GET  `/meditation/types` : obtention des types actifs de méditation
 * - GET  `/meditation/contents` : contenus filtrés pour un type et une durée
 *
 * Les règles métier et accès BDD sont délégués au `MeditationSessionService`.
 *
 * Pour Swagger :
 * - Les décorateurs `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` etc.
 *   se placent directement sur les méthodes concernées.
 */
@Controller('meditation')
export class MeditationSessionController {
  constructor(private readonly meditationService: MeditationSessionService) {}

  /**
   * Crée une nouvelle séance de méditation.
   *
   * Payload validé par `CreateMeditationSessionDto`.
   *
   * @param dto Données complétant la séance (type, durée, humeur…).
   * @returns La séance créée (entité Prisma).
   */
  @Post()
  create(@Body() dto: CreateMeditationSessionDto) {
    return this.meditationService.create(dto);
  }

  /**
   * Récupère l’intégralité des séances enregistrées.
   *
   * Souvent utilisé pour du debug ou un back-office.
   *
   * @returns Liste complète des séances, triées par date.
   */
  @Get()
  findAll() {
    return this.meditationService.findAll();
  }

  /**
   * Retourne les séances des 7 derniers jours sous forme d’un résumé compact.
   *
   * Format inclut :
   * - date (YYYY-MM-DD)
   * - durée en secondes
   * - humeur finale
   *
   * @returns Résumé des 7 derniers jours.
   */
  @Get('last7days')
  getLast7Days() {
    return this.meditationService.getLast7Days();
  }

  /**
   * Donne un résumé des séances d’hier :
   * - durée totale
   * - dernière humeur de la journée
   *
   * @returns Objet résumé (`durationSeconds`, `moodAfter`).
   */
  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.meditationService.getYesterdaySummary();
  }

  /**
   * Récupère la liste des types de méditation actifs,
   * triés selon `sortOrder`.
   *
   * @returns Liste des types sous forme de DTO.
   */
  @Get('types')
  async getMeditationTypes() {
    return this.meditationService.getMeditationTypes();
  }

  /**
   * Récupère les contenus de méditation filtrés par :
   * - type (`meditationTypeId`)
   * - durée souhaitée (optionnelle, en secondes)
   *
   * Le service applique ensuite des règles sur `minDurationSeconds`
   * et `maxDurationSeconds` pour ne retourner que les contenus compatibles.
   *
   * @param meditationTypeId Identifiant du type de méditation.
   * @param durationSeconds Durée souhaitée en secondes (facultative).
   * @returns Liste des contenus compatibles sous forme DTO front.
   */
  @Get('contents')
  getMeditationContents(
    @Query('meditationTypeId') meditationTypeId: string,
    @Query('durationSeconds') durationSeconds?: string,
  ) {
    const parsedDuration = durationSeconds
      ? parseInt(durationSeconds, 10)
      : undefined;

    return this.meditationService.getMeditationContents(
      meditationTypeId,
      parsedDuration,
    );
  }
}
