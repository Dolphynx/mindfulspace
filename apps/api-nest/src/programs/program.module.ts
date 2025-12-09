import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [ProgramController],
    providers: [ProgramService, PrismaService],
})
export class ProgramModule {}
