import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@mindfulspace/api/auth/decorators/current-user.decorator';
import { UserProgramService } from '@mindfulspace/api/programs/user-program.service';

@Controller('user-programs')
export class UserProgramController {
  constructor(private readonly service: UserProgramService) {}

  /**
   * Liste des programmes de l’utilisateur
   * GET /user-programs?lang=fr
   */
  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.service.findAll(userId, { lang });
  }

  /**
   * Détail d’un programme utilisateur
   * GET /user-programs/:id?lang=fr
   */
  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') userProgramId: string,
    @Query('lang') lang: string = 'en',
  ) {
    return this.service.findOne(userId, userProgramId, { lang });
  }

  /**
   * Suppression d’un programme utilisateur
   * DELETE /user-programs/:id
   */
  @Delete(':id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.delete(userId, id);
  }

  /**
   * Statut d’abonnement
   * GET /user-programs/status/:programId
   */
  @Get('status/:programId')
  async isSubscribed(
    @CurrentUser('id') userId: string,
    @Param('programId') programId: string,
  ) {
    const record = await this.service.isSubscribed(userId, programId);

    return {
      subscribed: !!record,
      userProgramId: record?.id ?? null,
    };
  }
}
