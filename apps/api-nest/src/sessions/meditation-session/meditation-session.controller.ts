import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de méditation.
 *
 * @remarks
 * Il expose les routes suivantes :
 *
 * - **POST `/meditation`** : création d’une nouvelle séance.
 * - **GET `/meditation`** : récupération brute de toutes les séances (debug / back-office).
 * - **GET `/meditation/last7days`** : résumé compact des 7 derniers jours.
 * - **GET `/meditation/summary/yesterday`** : résumé des séances d’hier.
 * - **GET `/meditation/types`** *(public)* : obtention des types actifs de méditation.
 * - **GET `/meditation/contents`** *(public)* : obtention des contenus filtrés.
 *
 * Le contrôleur délègue la logique métier et l’accès aux données
 * au service {@link MeditationSessionService}.
 *
 * @see MeditationSessionService
 *
 * @remarks Swagger
 * Les décorateurs tels que `@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.
 * doivent être placés directement sur les méthodes concernées, si nécessaire.
 */
@Controller('meditation')
export class MeditationSessionController {
  constructor(private readonly meditationService: MeditationSessionService) {}

  /**
   * Crée une nouvelle séance de méditation pour l’utilisateur courant.
   *
   * @remarks
   * Les données reçues sont validées par {@link CreateMeditationSessionDto}, qui contient
   * notamment :
   * - l’identifiant du type de méditation ;
   * - l’identifiant éventuel du contenu utilisé ;
   * - la durée totale ;
   * - les humeurs avant/après (optionnelles) ;
   * - la date de séance.
   *
   * @param userId Identifiant de l’utilisateur authentifié (extrait du token).
   * @param dto Données complètes de la séance à créer.
   * @returns La séance de méditation créée.
   */
  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMeditationSessionDto,
  ) {
    return this.meditationService.create(userId, dto);
  }

  /**
   * Récupère l’ensemble des séances de méditation enregistrées en base.
   *
   * @remarks
   * Utilisation typique :
   * - debug,
   * - back-office interne,
   * - contrôles ponctuels.
   *
   * @returns La liste complète des séances, généralement triées par date.
   */
  @Get()
  findAll() {
    return this.meditationService.findAll();
  }

  /**
   * Retourne un résumé compact des séances des 7 derniers jours
   * pour l’utilisateur courant.
   *
   * @remarks
   * Chaque entrée du tableau retourné inclut au minimum :
   * - `date` (format `YYYY-MM-DD`) ;
   * - `durationSeconds` (durée totale de la séance) ;
   * - `moodAfter` (humeur finale, optionnelle).
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @returns Un tableau de résumés journaliers.
   */
  @Get('last7days')
  getLast7Days(@CurrentUser('id') userId: string) {
    return this.meditationService.getLast7Days(userId);
  }

  /**
   * Retourne un résumé des séances de méditation enregistrées la veille
   * pour l’utilisateur courant.
   *
   * @remarks
   * Le résumé inclut :
   * - la durée cumulée de toutes les séances ;
   * - la dernière humeur finale enregistrée.
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @returns Un objet résumé `{ durationSeconds, moodAfter }`.
   */
  @Get('summary/yesterday')
  getYesterdaySummary(@CurrentUser('id') userId: string) {
    return this.meditationService.getYesterdaySummary(userId);
  }

  /**
   * Liste publique des types de méditation actifs.
   *
   * @remarks
   * Le service retourne :
   * - uniquement les types `isActive = true` ;
   * - triés selon `sortOrder`.
   *
   * Endpoint non protégé grâce au décorateur {@link Public}.
   *
   * @returns Une liste de types de méditation prêts à être consommés par le frontend.
   */
  @Public()
  @Get('types')
  async getMeditationTypes() {
    return this.meditationService.getMeditationTypes();
  }

  /**
   * Liste publique des contenus de méditation filtrés selon :
   * - `meditationTypeId` (obligatoire),
   * - `durationSeconds` (facultatif).
   *
   * @remarks
   * Le service applique automatiquement les règles de compatibilité
   * basées sur :
   * - `minDurationSeconds`,
   * - `maxDurationSeconds`,
   * - `isActive`,
   * - `isPremium` (la logique d’accès éventuelle reste côté front ou middleware).
   *
   * Endpoint non protégé grâce au décorateur {@link Public}.
   *
   * @param meditationTypeId Identifiant du type de méditation.
   * @param durationSeconds Durée souhaitée, en secondes (facultatif, provenant de la query string).
   * @returns Les contenus compatibles sous forme de DTO pour le frontend.
   */
  @Public()
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
