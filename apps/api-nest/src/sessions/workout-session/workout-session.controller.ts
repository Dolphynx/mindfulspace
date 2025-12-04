import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WorkoutSessionService } from './workout-session.service';
import { CreateWorkoutSessionDto } from './dto/workout-session.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

/**
 * Contrôleur HTTP regroupant les endpoints liés aux séances de sport.
 *
 * Routes principales :
 * - POST `/workouts`                : crée / met à jour la séance du jour pour l’utilisateur courant.
 * - GET  `/workouts`                : liste des séances de l’utilisateur courant.
 * - GET  `/workouts/last7days`      : résumé des 7 derniers jours (utilisé par le frontend).
 * - GET  `/workouts/summary/yesterday` : résumé de la veille.
 * - GET  `/workouts/exercice-types` : liste publique des types d’exercices.
 * - GET  `/workouts/:id`            : détail d’une séance appartenant à l’utilisateur courant.
 */
@Controller('workouts')
export class WorkoutSessionController {
    constructor(private readonly workoutService: WorkoutSessionService) {}

    /**
     * Crée ou met à jour une séance de sport pour l’utilisateur courant.
     *
     * Règles :
     * - une seule séance par jour et par utilisateur ;
     * - si une séance existe déjà ce jour-là → mise à jour (quality, exercices, etc.).
     */
    @Post()
    create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateWorkoutSessionDto,
    ) {
        return this.workoutService.create(userId, dto);
    }

    /**
     * Récupère toutes les séances de l’utilisateur courant,
     * généralement ordonnées par date décroissante.
     */
    @Get()
    findAll(@CurrentUser('id') userId: string) {
        return this.workoutService.findAll(userId);
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
        return this.workoutService.getLast7Days(userId);
    }

    /**
     * Résumé de la séance de la veille pour l’utilisateur courant.
     *
     * Si aucune séance n’est trouvée, renvoie une structure vide
     * avec la date d’hier et un tableau d’exercices vide.
     */
    @Get('summary/yesterday')
    getYesterdaySummary(@CurrentUser('id') userId: string) {
        return this.workoutService.getYesterdaySummary(userId);
    }

    /**
     * Liste publique des types d’exercices disponibles.
     *
     * Utilisé par le frontend pour construire les formulaires
     * de saisie d’une séance de sport.
     */
    @Public()
    @Get('exercice-types')
    getExerciceTypes() {
        return this.workoutService.getExerciceTypes();
    }

    /**
     * Détail d’une séance spécifique appartenant à l’utilisateur courant.
     *
     * Si la séance n’existe pas ou n’appartient pas à l’utilisateur :
     * - NotFound / Forbidden.
     */
    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.workoutService.findOne(id, userId);
    }
}
