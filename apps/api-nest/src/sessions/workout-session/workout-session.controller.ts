// src/workout-session/workout-session.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WorkoutSessionService } from './workout-session.service';
import { CreateWorkoutSessionDto } from './dto/workout-session.dto';

@Controller('workouts')
export class WorkoutSessionController {
  constructor(private readonly workoutService: WorkoutSessionService) {}

  @Post()
  create(@Body() dto: CreateWorkoutSessionDto) {
    return this.workoutService.create(dto);
  }

  @Get()
  findAll() {
    return this.workoutService.findAll();
  }

  @Get('last7days')
  getLast7Days() {
    return this.workoutService.getLast7Days();
  }

  @Get('summary/yesterday')
  getYesterdaySummary() {
    return this.workoutService.getYesterdaySummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }
}
