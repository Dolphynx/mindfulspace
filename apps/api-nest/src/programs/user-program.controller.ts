import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CurrentUser } from '@mindfulspace/api/auth/decorators/current-user.decorator';
import { UserProgramService } from '@mindfulspace/api/programs/user-program.service';


@Controller('user/programs')
export class UserProgramController {
  constructor(private service: UserProgramService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: { programId: string }) {
    return this.service.create(userId, dto.programId);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }

  @Delete(':id')
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.delete(userId, id);
  }

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

