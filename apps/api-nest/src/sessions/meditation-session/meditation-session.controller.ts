import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de méditation.
 *
 * Il expose les routes suivantes :
 *
 * - **POST `/meditation`** : création d’une nouvelle séance.
 * - **GET `/meditation`** : récupération brute de toutes les séances (debug / back-office).
 * - **GET `/meditation/last7days`** : résumé compact des 7 derniers jours.
 * - **GET `/meditation/summary/yesterday`** : résumé des séances d’hier.
 * - **GET `/meditation/types`** *(public)* : obtention des types actifs de méditation.
 * - **GET `/meditation/contents`** *(public)* : obtention des contenus filtrés.
 *
 * Le contrôleur délègue toute la logique métier et l’accès aux données
 * au {@link MeditationSessionService}.
 *
 * ### Remarque Swagger
 * Les décorateurs tels que `@ApiTags`, `@ApiOperation`, `@ApiResponse`…
 * doivent être placés directement sur les méthodes concernées, si nécessaires.
 */
@Controller('meditation')
export class MeditationSessionController {
  constructor(private readonly meditationService: MeditationSessionService) {}

  /**
   * Création d’une séance de méditation.
   *
   * Les données reçues sont validées par {@link CreateMeditationSessionDto}.
   * Ce DTO contient notamment :
   * - l’identifiant du type de méditation,
   * - l’identifiant éventuel du contenu utilisé,
   * - la durée totale,
   * - les humeurs avant/après (optionnelles),
   * - la date de séance.
   *
   * @param dto Données complètes de la séance à créer.
   * @returns L'entité créée (objet Prisma ou équivalent).
   */
  @Post()
  create(@Body() dto: CreateMeditationSessionDto) {
    return this.meditationService.create(dto);
  }

  /**
   * Récupération *non filtrée* de toutes les séances enregistrées en base.
   *
   * Utilisé principalement :
   * - pour du debug,
   * - pour un back-office interne,
   * - ou pour des contrôles ponctuels.
   *
   * @returns L’intégralité des séances, généralement triées par date.
   */
  @Get()
  findAll() {
    return this.meditationService.findAll();
  }

  /**
   * Résumé compact des séances des 7 derniers jours.
   *
   * Chaque entrée du tableau retourné inclut a minima :
   * - `date` (format `YYYY-MM-DD`),
   * - `durationSeconds` (durée totale de la séance),
   * - `moodAfter` (humeur finale, optionnelle).
   *
   * @returns Un tableau de résumés journaliers.
   */
  @Get('last7days')
  getLast7Days() {
    return this.meditationService.getLast7Days();
  }

  /**
   * Résumé des séances enregistrées la veille :
   * - durée cumulée de toutes les séances,
   * - dernière humeur finale enregistrée.
   *
   * @returns Un objet résumé `{ durationSeconds, moodAfter }`.
   */
  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.meditationService.getYesterdaySummary();
  }

  /**
   * Liste publique des types de méditation actifs.
   *
   * Le service les retourne triés selon `sortOrder`,
   * et uniquement ceux marqués `isActive = true`.
   *
   * Endpoint *non protégé* grâce au décorateur {@link Public}.
   *
   * @returns Une liste de types de méditation prêts pour le frontend.
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
   * Le service applique automatiquement les règles de compatibilité
   * basées sur :
   * - `minDurationSeconds`,
   * - `maxDurationSeconds`,
   * - `isActive`,
   * - `isPremium` (la logique d'accès se fait côté front).
   *
   * Endpoint *non protégé* grâce au décorateur {@link Public}.
   *
   * @param meditationTypeId Identifiant du type de méditation.
   * @param durationSeconds Durée souhaitée, en secondes (facultatif).
   * @returns Les contenus compatibles sous forme DTO pour le frontend.
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
