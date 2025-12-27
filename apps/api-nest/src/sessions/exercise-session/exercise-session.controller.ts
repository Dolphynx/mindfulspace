import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ExerciseSessionService } from './exercise-session.service';
import { CreateExerciceSessionDto } from './dto/exercise-session.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { BadgesService } from '@mindfulspace/api/badges/badges.service';

@Controller('exercices')
export class ExerciseSessionController {
  constructor(
    private readonly exerciceSessionService: ExerciseSessionService,
    private readonly badgesService: BadgesService,
  ) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExerciceSessionDto,
  ) {
    const session = await this.exerciceSessionService.create(userId, dto);
    const newBadges = await this.badgesService.checkForNewBadges(userId);
    return { session, newBadges };
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('lang') lang: string = 'en',
    @Query('lastDays') lastDays?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (lastDays) {
      const n = parseInt(lastDays, 10);
      const safeN = Number.isNaN(n) || n <= 0 ? 7 : n;
      return this.exerciceSessionService.getLastNDays(userId, safeN, { lang });
    }

    if (from || to) {
      return this.exerciceSessionService.getSessionsBetweenDates(
        userId,
        { from, to },
        { lang },
      );
    }

    return this.exerciceSessionService.findAll(userId, { lang });
  }

  @Get('last7days')
  getLast7Days(
    @CurrentUser('id') userId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.exerciceSessionService.getLast7Days(userId, { lang });
  }

  @Get('summary/yesterday')
  getYesterdaySummary(
    @CurrentUser('id') userId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.exerciceSessionService.getYesterdaySummary(userId, { lang });
  }

  @Public()
  @Get('exercice-content')
  getExerciceContents(
    @Query('lang') lang: string = 'en',
  ) {
    return this.exerciceSessionService.getExerciceContents({ lang });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.exerciceSessionService.findOne(id, userId, { lang });
  }
}
