import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { UserProgramController } from '@mindfulspace/api/programs/user-program.controller';
import { UserProgramService } from '@mindfulspace/api/programs/user-program.service';

@Module({
  controllers: [ProgramController, UserProgramController],
  providers: [ProgramService, UserProgramService],
})
export class ProgramsModule {}
