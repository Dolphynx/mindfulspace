import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TestData } from '@prisma/client';

@Injectable()
export class TestDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetric(metricName: string) {
    const rows: TestData[] = await this.prisma.testData.findMany({
      where: { metricName },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((r) => ({
      label: r.label,
      value: r.metricValue,
    }));
  }
}
