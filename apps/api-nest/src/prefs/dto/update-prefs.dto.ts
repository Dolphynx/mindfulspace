import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrefsDto {
  @ApiProperty({
    description: "Si vrai, lance l’exercice de respiration au démarrage de MindfulSpace.",
    example: true,
  })
  launchBreathingOnStart!: boolean;
}
