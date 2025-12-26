import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from "@nestjs/common";
import { BadgesService } from "@mindfulspace/api/badges/badges.service";

import { MeditationSessionService } from "./meditation-session.service";
import { CreateMeditationSessionDto } from "./dto/meditation-session.dto";
import { GetMeditationSessionsQueryDto } from "./dto/query/get-meditation-sessions.query.dto";
import { GetDailySummaryQueryDto } from "./dto/query/get-daily-summary.query.dto";
import { GetMeditationContentsQueryDto } from "./dto/query/get-meditation-contents.query.dto";

import { Public } from "../../auth/decorators/public.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de méditation.
 *
 * @remarks
 * Il expose les routes REST suivantes :
 * - **POST `/me/meditation-sessions`** : création d’une nouvelle séance pour l’utilisateur courant.
 * - **GET `/me/meditation-sessions`** : récupération des séances de l’utilisateur courant, avec filtrage possible.
 * - **GET `/me/meditation-summaries/daily`** : résumé quotidien des séances (date fournie ou veille par défaut).
 * - **GET `/admin/meditation-sessions`** : récupération brute de toutes les séances (debug / back-office).
 * - **GET `/meditation-types`** *(public)* : obtention des types actifs de méditation.
 * - **GET `/meditation-contents`** *(public)* : obtention des contenus filtrés.
 *
 * Le contrôleur délègue la logique métier et l’accès aux données
 * au service {@link MeditationSessionService}.
 *
 * @see MeditationSessionService
 */
@Controller()
export class MeditationSessionController {
  constructor(
    private readonly meditationService: MeditationSessionService,
    private readonly badgesService: BadgesService,
  ) {}

  /**
   * Crée une nouvelle séance de méditation pour l’utilisateur courant.
   *
   * @param userId Identifiant de l’utilisateur authentifié (extrait du token).
   * @param dto Données complètes de la séance à créer.
   * @returns Un objet contenant la séance créée et les éventuels nouveaux badges débloqués.
   */
  @Post("me/meditation-sessions")
  async createForCurrentUser(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateMeditationSessionDto,
  ): Promise<{ session: unknown; newBadges: unknown[] }> {
    const session = await this.meditationService.create(userId, dto);
    const newBadges = await this.badgesService.checkForNewBadges(userId);

    return { session, newBadges };
  }

  /**
   * Récupère les séances de méditation de l’utilisateur courant.
   *
   * @remarks
   * Le comportement dépend des paramètres de query :
   * - `lastDays` : retourne les `N` derniers jours (fallback : 7) ;
   * - `from` / `to` : filtre les séances dans une plage de dates (format `YYYY-MM-DD`) ;
   * - aucun paramètre : retourne l’historique complet de l’utilisateur.
   *
   * Règle : `from` et `to` doivent être fournis ensemble.
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @param query Paramètres de filtrage validés.
   * @returns Un tableau de résumés journaliers pour l’utilisateur courant.
   * @throws BadRequestException Si `from` et `to` ne sont pas fournis ensemble.
   */
  @Get("me/meditation-sessions")
  getSessionsForCurrentUser(
    @CurrentUser("id") userId: string,
    @Query() query: GetMeditationSessionsQueryDto,
  ) {
    const hasFrom = query.from !== undefined;
    const hasTo = query.to !== undefined;

    if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
      throw new BadRequestException("from et to doivent être fournis ensemble");
    }

    if (query.from && query.to) {
      return this.meditationService.getSessionsBetweenDates(userId, {
        from: query.from,
        to: query.to,
      });
    }

    const lastDays = query.lastDays ?? 7;
    return this.meditationService.getLastNDays(userId, lastDays);
  }

  /**
   * Retourne un résumé quotidien des séances de méditation pour l’utilisateur courant.
   *
   * @remarks
   * Le résumé inclut :
   * - la durée cumulée de toutes les séances ;
   * - la dernière humeur finale enregistrée.
   *
   * Si aucun paramètre `date` n’est fourni, le service calcule le résumé pour la veille.
   *
   * @param userId Identifiant de l’utilisateur authentifié.
   * @param query Paramètres de query validés.
   * @returns Un objet résumé `{ durationSeconds, moodAfter }`.
   */
  @Get("me/meditation-summaries/daily")
  getDailySummary(
    @CurrentUser("id") userId: string,
    @Query() query: GetDailySummaryQueryDto,
  ) {
    return this.meditationService.getDailySummary(userId, query.date);
  }

  /**
   * Récupère l'ensemble des séances de méditation enregistrées en base.
   *
   * @remarks
   * Utilisation typique :
   * - debug,
   * - back-office interne,
   * - contrôles ponctuels.
   *
   * **Sécurité** : réservé aux administrateurs uniquement.
   *
   * @returns La liste complète des séances, généralement triées par date.
   */
  @Roles("admin")
  @Get("admin/meditation-sessions")
  findAll() {
    return this.meditationService.findAll();
  }

  /**
   * Liste publique des types de méditation actifs.
   *
   * @remarks
   * Le service retourne :
   * - uniquement les types `isActive = true` ;
   * - triés selon `sortOrder'.
   *
   * Endpoint non protégé grâce au décorateur {@link Public}.
   *
   * @returns Une liste de types de méditation prêts à être consommés par le frontend.
   */
  @Public()
  @Get("meditation-types")
  getMeditationTypes() {
    return this.meditationService.getMeditationTypes();
  }

  /**
   * Liste publique des contenus de méditation filtrés selon :
   * - `meditationTypeId` (obligatoire),
   * - `durationSeconds` (facultatif).
   *
   * @remarks
   * Le service applique automatiquement les règles de compatibilité basées sur :
   * - `minDurationSeconds',
   * - `maxDurationSeconds',
   * - `isActive'.
   *
   * Endpoint non protégé grâce au décorateur {@link Public}.
   *
   * @param query Paramètres de query validés.
   * @returns Les contenus compatibles sous forme de DTO pour le frontend.
   * @throws BadRequestException Si `meditationTypeId` est manquant.
   */
  @Public()
  @Get("meditation-contents")
  getMeditationContents(@Query() query: GetMeditationContentsQueryDto) {
    if (!query.meditationTypeId) {
      throw new BadRequestException("meditationTypeId est requis");
    }

    return this.meditationService.getMeditationContents(
      query.meditationTypeId,
      query.durationSeconds,
    );
  }
}
