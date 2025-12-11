import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ExerciceSessionService } from './exercice-session.service';
import { CreateExerciceSessionDto } from './dto/exercice-session.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { BadgesService } from '@mindfulspace/api/badges/badges.service';

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de sport.
 *
 * Routes principales :
 * - POST `/exercices`                : crée / met à jour la séance du jour pour l’utilisateur courant.
 * - GET  `/exercices`                : liste des séances de l’utilisateur courant.
 * - GET  `/exercices/last7days`      : résumé des 7 derniers jours (utilisé par le frontend).
 * - GET  `/exercices/summary/yesterday` : résumé de la veille.
 * - GET  `/exercices/exercice-content` : liste publique des types d’exercices.
 * - GET  `/exercices/:id`            : détail d’une séance appartenant à l’utilisateur courant.
 */
@Controller('exercices')
export class ExerciceSessionController {
    constructor(
      private readonly exerciceSessionService: ExerciceSessionService,
                private readonly badgesService: BadgesService
    ) {}

    /**
     * Crée ou met à jour une séance de sport pour l’utilisateur courant.
     *
     * Règles :
     * - une seule séance par jour et par utilisateur ;
     * - si une séance existe déjà ce jour-là → mise à jour (quality, exercices, etc.).
     */
    @Post()
    async create(
      @CurrentUser('id') userId: string,
      @Body() dto: CreateExerciceSessionDto,
    ) {
      const session = await this.exerciceSessionService.create(userId, dto);
      const newBadges = await this.badgesService.checkForNewBadges(userId);

      // Retourne la session nouvellement créée ainsi que les éventuels nouveaux
      // badges débloqués à cette occasion. Ce format de réponse est commun à
      // l’ensemble des types de sessions pour garantir une structure uniforme.
      return { session, newBadges };
    }

    /**
     * Récupère toutes les séances de l’utilisateur courant,
     * généralement ordonnées par date décroissante.
     */
    @Get()
    findAll(@CurrentUser('id') userId: string) {
        return this.exerciceSessionService.findAll(userId);
    }

    /**
     * Retourne un résumé des séances des 7 derniers jours
     * pour l’utilisateur courant.
     *
     * Format adapté au frontend :
     * - `id`
     * - `date` (YYYY-MM-DD)
     * - `quality`
     * - `exercices[]` (type + repetitions)
     */
    @Get('last7days')
    getLast7Days(@CurrentUser('id') userId: string) {
        return this.exerciceSessionService.getLast7Days(userId);
    }

    /**
     * Résumé de la séance de la veille pour l’utilisateur courant.
     *
     * Si aucune séance n’est trouvée, renvoie une structure vide
     * avec la date d’hier et un tableau d’exercices vide.
     */
    @Get('summary/yesterday')
    getYesterdaySummary(@CurrentUser('id') userId: string) {
        return this.exerciceSessionService.getYesterdaySummary(userId);
    }

    /**
     * Liste publique des types d’exercices disponibles.
     *
     * Utilisé par le frontend pour construire les formulaires
     * de saisie d’une séance de sport.
     */
    @Public()
    @Get('exercice-content')
    getExerciceContents() {
        return this.exerciceSessionService.getExerciceContents();
    }

    /**
     * Détail d’une séance spécifique appartenant à l’utilisateur courant.
     *
     * Si la séance n’existe pas ou n’appartient pas à l’utilisateur :
     * - NotFound / Forbidden.
     */
    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.exerciceSessionService.findOne(id, userId);
    }
}
