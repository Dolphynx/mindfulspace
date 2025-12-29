/**
 * TipsModule
 * ----------
 * Module NestJS dédié aux "astuces bien-être" de MindfulSpace.
 *
 * @remarks
 * Ce module a été introduit lors d’une phase de prototypage afin de
 * tester l’intégration d’astuces bien-être dans l’application
 * (API, i18n, affichage côté frontend).
 *
 * Les astuces sont actuellement statiques et chargées depuis des
 * fichiers de données. Cette approche a permis de :
 * - valider les flux applicatifs,
 * - tester l’exposition d’une API simple,
 * - préparer l’architecture en vue d’une génération dynamique
 *   d’astuces via un service d’IA.
 *
 * La génération d’astuces par IA n’a pas été mise en place dans
 * cette version du projet. Le module est néanmoins conservé afin de :
 * - documenter les choix techniques explorés,
 * - maintenir une API fonctionnelle et cohérente,
 * - servir de base si une intégration IA est ajoutée ultérieurement.
 *
 * Contient :
 * - TipsController : expose l’endpoint HTTP /tips/random (phase de test)
 * - TipsService    : charge les astuces statiques et fournit `getRandomTip()`
 *
 * Le service est exporté afin de permettre une éventuelle réutilisation
 * par d’autres modules (ex. combinaison tips + IA).
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
