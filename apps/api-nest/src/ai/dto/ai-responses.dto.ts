import { ApiProperty } from '@nestjs/swagger';

/**
 * MantraResponseDto
 * -----------------
 * DTO utilisé comme structure de retour pour le endpoint :
 *   POST /ai/mantra
 *
 * Ce DTO permet à Swagger d’afficher clairement :
 * - le type retourné
 * - la forme du JSON
 * - un exemple de réponse
 *
 * Propriété :
 * - mantra : string — mini-mantra généré par l’IA
 */
export class MantraResponseDto {
  @ApiProperty({
    description: 'Mini-mantra généré par l’IA.',
    example: 'Je respire, je me recentre, je suis en paix.',
  })
  mantra!: string;
}

/**
 * EncouragementResponseDto
 * ------------------------
 * DTO utilisé comme structure de retour pour le endpoint :
 *   POST /ai/encouragement
 *
 * Structure simple contenant uniquement un message d’encouragement.
 *
 * Propriété :
 * - encouragement : string — message court, bienveillant et positif
 */
export class EncouragementResponseDto {
  @ApiProperty({
    description: 'Message d’encouragement court, bienveillant et positif.',
    example: 'Tu fais déjà de ton mieux, et c’est suffisant pour aujourd’hui.',
  })
  encouragement!: string;
}

/**
 * ObjectivesResponseDto
 * ----------------------
 * DTO utilisé comme structure de retour pour le endpoint :
 *   POST /ai/objectives
 *
 * Le backend retournera systématiquement un objet contenant
 * trois niveaux d’objectifs :
 *   - easy      → simple / débutant
 *   - normal    → intermédiaire
 *   - ambitious → avancé
 *
 * Ce DTO est indispensable pour Swagger :
 * - garantit un schéma JSON clair
 * - permet de valider la forme des données générées par l’IA
 */
export class ObjectivesResponseDto {
  @ApiProperty({
    description: 'Objectif niveau facile.',
    example: 'Prendre 3 minutes ce soir pour respirer calmement avant de dormir.',
  })
  easy!: string;

  @ApiProperty({
    description: 'Objectif niveau normal.',
    example: 'Faire une courte méditation guidée de 10 minutes chaque jour cette semaine.',
  })
  normal!: string;

  @ApiProperty({
    description: 'Objectif niveau ambitieux.',
    example:
      'Bloquer 30 minutes deux fois par semaine pour un moment de pleine conscience sans écran.',
  })
  ambitious!: string;
}
