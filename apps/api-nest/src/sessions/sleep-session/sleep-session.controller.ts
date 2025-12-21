// sleep-session.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SleepSessionService } from './sleep-session.service';
import { CreateSleepSessionDto } from './dto/sleep-session.dto';
import { CurrentUser } from '@mindfulspace/api/auth/decorators/current-user.decorator';
import { BadgesService } from '@mindfulspace/api/badges/badges.service';

@Controller('sleep')
export class SleepSessionController {
  constructor(
    private readonly sleepService: SleepSessionService,
    private readonly badgesService: BadgesService,
  ) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSleepSessionDto,
  ) {
    const session = await this.sleepService.create(userId, dto);
    const newBadges = await this.badgesService.checkForNewBadges(userId);

    return { session, newBadges };
  }

  /**
   * ⚠️ Endpoint existant (potentiellement utilisé ailleurs).
   * On le garde tel quel pour ne rien casser.
   */
  @Get()
  findAll() {
    return this.sleepService.findAll();
  }

  /**
   * ✅ Endpoint EXISTANT consommé par le front (ne pas casser)
   */
  @Get('last7days')
  getLast7Days(@CurrentUser('id') userId: string) {
    return this.sleepService.getLast7Days(userId);
  }

  /**
   * ✅ NOUVEL endpoint pour les pages détails (additif, sans casser l’existant)
   * - /sleep/me/sessions?lastDays=30
   * - /sleep/me/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
   * - /sleep/me/sessions (historique complet pour l’utilisateur)
   */
  @Get('me/sessions')
  getSessionsForCurrentUser(
    @CurrentUser('id') userId: string,
    @Query('lastDays') lastDays?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (lastDays) {
      const n = parseInt(lastDays, 10);
      const safeN = Number.isNaN(n) || n <= 0 ? 7 : n;
      return this.sleepService.getLastNDays(userId, safeN);
    }

    if (from || to) {
      return this.sleepService.getSessionsBetweenDates(userId, { from, to });
    }

    return this.sleepService.getAllForUser(userId);
  }

  /**
   * ⚠️ Endpoint existant (actuellement pas user-scopé).
   * On le garde pour ne pas casser, mais à terme je te conseille de le déprécier.
   */
  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.sleepService.getYesterdaySummary();
  }

  /**
   * ✅ NOUVEAU (optionnel) : résumé user-scopé
   * /sleep/me/summary/daily?date=YYYY-MM-DD (sinon hier)
   */
  @Get('me/summary/daily')
  getDailySummary(
    @CurrentUser('id') userId: string,
    @Query('date') date?: string,
  ) {
    return this.sleepService.getDailySummary(userId, date);
  }
}
