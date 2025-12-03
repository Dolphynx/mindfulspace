import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de méditation.
 *
 * @remarks
 * Il expose les routes RESTful suivantes :
 *
 * - **POST `/me/meditation-sessions`** : création d’une nouvelle séance pour l’utilisateur courant.
 * - **GET `/me/meditation-sessions`** : récupération des séances de l’utilisateur courant, avec filtrage possible.
 * - **GET `/me/meditation-summaries/daily`** : résumé quotidien des séances (date fournie ou “hier” par défaut).
 * - **GET `/admin/meditation-sessions`** : récupération brute de toutes les séances (debug / back-office).
 * - **GET `/meditation-types`** *(public)* : obtention des types actifs de méditation.
 * - **GET `/meditation-contents`** *(public)* : obtention des contenus filtrés.
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
@Controller()
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
  @Post('me/meditation-sessions')
  createForCurrentUser(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMeditationSessionDto,
  ) {
    return this.meditationService.create(userId, dto);
  }

  /**
   * Récupère les séances de méditation de l’utilisateur courant.
   *
   * @remarks
   * Le comportement dépend des paramètres de la query string :
   *
   * - `lastDays` : retourne un résumé des `N` derniers jours
   *   (équivalent RESTful de l’ancien endpoint `/meditation/last7days`) ;
   * - `from` / `to` : filtre les séances dans une plage de dates donnée
   *   (format `YYYY-MM-DD`) ;
   * - aucun paramètre : retourne l’historique complet de l’utilisateur
   *   sous forme de résumés journaliers minimalistes.
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @param lastDays Nombre de jours à remonter (optionnel).
   * @param from Date de début (incluse), au format `YYYY-MM-DD` (optionnel).
   * @param to Date de fin (incluse), au format `YYYY-MM-DD` (optionnel).
   * @returns Un tableau de résumés journaliers pour l’utilisateur courant.
   */
  @Get('me/meditation-sessions')
  getSessionsForCurrentUser(
    @CurrentUser('id') userId: string,
    @Query('lastDays') lastDays?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (lastDays) {
      const n = parseInt(lastDays, 10);
      const safeN = Number.isNaN(n) || n <= 0 ? 7 : n;
      return this.meditationService.getLastNDays(userId, safeN);
    }

    if (from || to) {
      return this.meditationService.getSessionsBetweenDates(userId, {
        from,
        to,
      });
    }

    return this.meditationService.getAllForUser(userId);
  }

  /**
   * Retourne un résumé quotidien des séances de méditation pour l’utilisateur courant.
   *
   * @remarks
   * Le résumé inclut :
   * - la durée cumulée de toutes les séances ;
   * - la dernière humeur finale enregistrée.
   *
   * Si aucun paramètre `date` n’est fourni, la méthode calcule le résumé pour la veille
   * (équivalent RESTful de l’ancien endpoint `/meditation/summary/yesterday`).
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @param date Date cible au format `YYYY-MM-DD` (facultative).
   * @returns Un objet résumé `{ durationSeconds, moodAfter }`.
   */
  @Get('me/meditation-summaries/daily')
  getDailySummary(
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    return this.meditationService.getDailySummary(userId, date);
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
  @Get('admin/meditation-sessions')
  findAll() {
    return this.meditationService.findAll();
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
  @Get('meditation-types')
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
   * @param meditationTypeId Identifiant du type de méditation (query string, obligatoire).
   * @param durationSeconds Durée souhaitée, en secondes (facultatif, provenant de la query string).
   * @returns Les contenus compatibles sous forme de DTO pour le frontend.
   */
  @Public()
  @Get('meditation-contents')
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
