import { Module } from "@nestjs/common";
import { ResourcesService } from "./resources.service";
import { ResourcesController } from "./resources.controller";
import { PrismaModule } from "../../prisma/prisma.module";

/**
 * Module chargé de la gestion des ressources.
 * Il regroupe le contrôleur, le service et les dépendances nécessaires
 * pour exposer et manipuler les données liées aux ressources.
 *
 * Ce module importe `PrismaModule` pour l’accès à la base de données
 * et exporte `ResourcesService` afin de permettre son utilisation
 * dans d’autres modules de l’application.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
