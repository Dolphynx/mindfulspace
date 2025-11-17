/**
 * PrefsModule
 * -----------
 * Module NestJS responsable de la gestion des préférences utilisateur.
 *
 * Contient :
 * - PrefsController : endpoints HTTP
 * - PrefsService    : logique métier + accès aux données de préférences
 *
 * Le service est exporté pour pouvoir être injecté dans d’autres modules
 * si nécessaire.
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
