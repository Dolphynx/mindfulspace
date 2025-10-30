import { Module } from '@nestjs/common';
import { TestDataService } from './test-data.service';
import { TestDataController } from './test-data.controller';

@Module({
  providers: [TestDataService],
  controllers: [TestDataController],
})
export class TestDataModule {}
