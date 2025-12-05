import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WorkoutProgramService } from './workout-program.service';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { Public } from '../../auth/decorators/public.decorator';


@Controller('programs/workout')
export class WorkoutProgramController {
    constructor(private readonly service: WorkoutProgramService) {}

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
    create(@Body() dto: CreateWorkoutProgramDto) {
        return this.service.create(dto);
    }
}
