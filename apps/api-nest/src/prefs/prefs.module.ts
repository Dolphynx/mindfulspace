/**
 * PrefsModule
 * -----------
 * Module NestJS responsable de la gestion des préférences utilisateur.
 *
 * @remarks
 * Ce module a été introduit lors d’une phase de prototypage afin de
 * simuler un système de préférences utilisateur et tester certains
 * comportements applicatifs (ex. déclenchement automatique d’une
 * séance de respiration au démarrage).
 *
 * La fonctionnalité associée ayant été abandonnée, le module est
 * conservé principalement pour :
 * - documenter les choix explorés durant le développement,
 * - maintenir la cohérence de l’API existante,
 * - servir de base si un système de préférences persistées est
 *   réintroduit ultérieurement.
 *
 * Dans l’état actuel, les préférences sont gérées en mémoire via
 * un service simple, sans persistance en base de données.
 *
 * Contient :
 * - PrefsController : endpoints HTTP (phase de test)
 * - PrefsService    : logique métier et accès aux données simulées
 *
 * Le service est exporté afin de permettre une éventuelle réutilisation
 * dans d’autres modules si nécessaire.
 */

import { Module } from "@nestjs/common";
import { PrefsController } from "./prefs.controller";
import { PrefsService } from "./prefs.service";

@Module({
  controllers: [PrefsController],
  providers: [PrefsService],
  exports: [PrefsService],
})
export class PrefsModule {}
