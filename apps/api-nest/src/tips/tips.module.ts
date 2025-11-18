/**
 * TipsModule
 * ----------
 * Module NestJS dédié aux "astuces bien-être" de MindfulSpace.
 *
 * Contient :
 * - TipsController : expose l’endpoint HTTP /tips/random
 * - TipsService    : charge les astuces et fournit `getRandomTip()`
 *
 * Le service est exporté pour être réutilisable par d’autres modules
 * (par exemple, un module IA qui voudrait combiner tips + AI).
 */

import { Module } from "@nestjs/common";
import { TipsController } from "./tips.controller";
import { TipsService } from "./tips.service";

@Module({
  controllers: [TipsController],
  providers: [TipsService],
  exports: [TipsService],
})
export class TipsModule {}
