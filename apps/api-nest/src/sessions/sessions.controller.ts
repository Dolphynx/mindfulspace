import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from '@mindfulspace/api/sessions/dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessions.create(dto);
  }

  @Get()
  async findAll() {
    return this.sessions.findAll();
  }

  @Get('types')
  getAllTypes() {
    return this.sessions.getAllSessionTypes();
  }

  @Get(':type/last7days')
  getSessionsByType(@Param('type') type: string) {
    return this.sessions.getSessionsLast7Days(type);
  }

  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.sessions.getYesterdaySummary();
  }

}
