// sleep-session.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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

    // Retourne la session nouvellement créée ainsi que les éventuels nouveaux
    // badges débloqués à cette occasion. Ce format de réponse est commun à
    // l’ensemble des types de sessions pour garantir une structure uniforme.
    return { session, newBadges };
  }

  @Get()
  findAll() {
    return this.sleepService.findAll();
  }

  @Get('last7days')
  getLast7Days(@CurrentUser('id') userId: string) {
    return this.sleepService.getLast7Days(userId);
  }

  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.sleepService.getYesterdaySummary();
  }
}
