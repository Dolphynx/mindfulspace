// sleep-session.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SleepSessionService } from './sleep-session.service';
import { CreateSleepSessionDto } from './dto/sleep-session.dto';
import { CurrentUser } from '@mindfulspace/api/auth/decorators/current-user.decorator';

@Controller('sleep')
export class SleepSessionController {
  constructor(private readonly sleepService: SleepSessionService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSleepSessionDto
  ) {
    return this.sleepService.create(userId, dto);
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
