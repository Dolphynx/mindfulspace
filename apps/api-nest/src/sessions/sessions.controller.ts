import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
