// sleep-session.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SleepSessionService } from './sleep-session.service';
import { CreateSleepSessionDto } from './dto/sleep-session.dto';

@Controller('sleep')
export class SleepSessionController {
  constructor(private readonly sleepService: SleepSessionService) {}

  @Post()
  create(@Body() dto: CreateSleepSessionDto) {
    return this.sleepService.create(dto);
  }

  @Get()
  findAll() {
    return this.sleepService.findAll();
  }

  @Get('last7days')
  getLast7Days() {
    return this.sleepService.getLast7Days();
  }

  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.sleepService.getYesterdaySummary();
  }
}
