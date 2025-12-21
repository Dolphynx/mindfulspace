import { Module } from "@nestjs/common";
import { WorldOverviewController } from "./world-overview.controller";
import { WorldOverviewService } from "./world-overview.service";
import { PrismaModule } from "../../prisma/prisma.module";

/**
 * @file world.module.ts
 * @description
 * Module regroupant les endpoints agrégés du "World Hub".
 */
@Module({
  imports: [PrismaModule],
  controllers: [WorldOverviewController],
  providers: [WorldOverviewService],
  exports: [WorldOverviewService],
})
export class WorldModule {}
