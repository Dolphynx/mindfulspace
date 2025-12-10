import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { Public } from '../auth/decorators/public.decorator';


@Controller('programs/')
export class ProgramController {
    constructor(private readonly service: ProgramService) {}

    @Public()
    @Get()
    getAll() {
        return this.service.getAll();
    }

    @Public()
    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.service.getOne(id);
    }

    @Public()
    @Post()
    create(@Body() dto: CreateProgramDto) {
        return this.service.create(dto);
    }
}
