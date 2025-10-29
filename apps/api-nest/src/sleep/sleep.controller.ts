import { Controller, Get, Post, Body } from '@nestjs/common';
import { SleepService } from './sleep.service';

@Controller('sleep') // 👈 This makes the route /sleep
export class SleepController {
    constructor(private readonly sleepService: SleepService) {}

    @Post()
    create(@Body() body: any) {
        console.log('Received data:', body);
        return this.sleepService.create(body);
    }

    @Get()
    findAll() {
        return this.sleepService.findAll();
    }
}
