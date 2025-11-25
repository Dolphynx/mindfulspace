import { Controller, Post, Body, Get } from '@nestjs/common';
import { MeditationSessionService } from './meditation-session.service';
import { CreateMeditationSessionDto } from './dto/meditation-session.dto';

@Controller('meditation')
export class MeditationSessionController {
  constructor(private readonly meditationService: MeditationSessionService) {}

  @Post()
  create(@Body() dto: CreateMeditationSessionDto) {
    return this.meditationService.create(dto);
  }

  @Get()
  findAll() {
    return this.meditationService.findAll();
  }

  @Get('last7days')
  getLast7Days() {
    return this.meditationService.getLast7Days();
  }

  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.meditationService.getYesterdaySummary();
  }

  @Get('types')
  async getMeditationTypes() {
    return this.meditationService.getMeditationTypes();
  }
}
