import { Module } from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { BadgesController } from "./badges.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  providers: [BadgesService, PrismaService],
  controllers: [BadgesController],
  exports: [BadgesService], // pour l'injecter dans d'autres modules
})
export class BadgesModule {}
