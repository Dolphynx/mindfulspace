import { Controller, Get, Query } from '@nestjs/common';
import { TestDataService } from './test-data.service';

@Controller('test-data')
export class TestDataController {
  constructor(private readonly testDataService: TestDataService) {}

  @Get()
  async getData(
    @Query('metricName') metricName = 'daily_meditation_minutes',
  ) {
    return this.testDataService.getMetric(metricName);
  }
}
