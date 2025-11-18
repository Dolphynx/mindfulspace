/**
 * DTO de mise à jour des préférences utilisateur.
 * -----------------------------------------------
 * Utilisé comme payload pour le endpoint :
 *   PATCH /prefs
 *
 * Actuellement, une seule préférence est gérée :
 * - launchBreathingOnStart : si vrai, l’exercice de respiration est lancé au démarrage.
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * Modèle d’entrée pour la mise à jour des préférences.
 */
export class UpdatePrefsDto {
  @ApiProperty({
    description: "Si vrai, lance l’exercice de respiration au démarrage de MindfulSpace.",
    example: true,
  })
  launchBreathingOnStart!: boolean;
}
