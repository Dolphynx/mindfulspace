import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  /**
   * Liste des programmes templates
   * GET /programs?lang=fr
   */
  @Public()
  @Get()
  getAll(
    @Query('lang') lang: string = 'en',
  ) {
    return this.programService.getAll({ lang });
  }

  /**
   * Détail d’un programme template
   * GET /programs/:id?lang=fr
   */
  @Public()
  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.programService.getOne(id, { lang });
  }

  /**
   * Création d’un programme template
   */
  @Post()
  create(
    @Body() dto: CreateProgramDto,
  ) {
    return this.programService.create(dto);
  }

  /**
   * Abonnement à un programme
   * POST /programs/:id/subscribe
   */
  @Post(':id/subscribe')
  subscribe(
    @CurrentUser('id') userId: string,
    @Param('id') programId: string,
  ) {
    return this.programService.subscribe(userId, programId);
  }
}
