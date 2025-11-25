import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MeditationSessionSource } from '@prisma/client';

/**
 * DTO de création d'une séance de méditation.
 *
 * Ce DTO est directement consommé par le contrôleur NestJS pour valider
 * le payload du POST `/meditation`.
 *
 * Il s'appuie sur `class-validator` pour :
 * - garantir la validité des champs envoyés par le front,
 * - assurer une cohérence stricte avec le contrat Swagger,
 * - éviter que des données non prévues ou mal typées atteignent la couche service.
 *
 * Notes importantes :
 * - `source` peut être MANUAL, WIZARD, TIMER, etc., selon l’enum Prisma.
 * - Les champs `moodBefore` et `moodAfter` acceptent uniquement des valeurs 1 à 5.
 * - `dateSession` doit être une ISO string complète : la cohérence horaire est ajustée dans le service.
 */
export class CreateMeditationSessionDto {
  // userId a été retiré : toujours injecté côté service

  /** Source de la séance, par défaut MANUAL. */
  @IsOptional()
  @IsEnum(MeditationSessionSource)
  source?: MeditationSessionSource;

  /** Identifiant du type de méditation (obligatoire). */
  @IsString()
  meditationTypeId!: string;

  /** Identifiant du contenu lié, si sélectionné (audio, visuel…). */
  @IsOptional()
  @IsString()
  meditationContentId?: string;

  /** Date et heure ISO de la séance (doit être valide ISO8601). */
  @IsISO8601()
  dateSession!: string;

  /** Durée totale de la séance en secondes, minimum 1 seconde. */
  @IsInt()
  @Min(1)
  durationSeconds!: number;

  /** Humeur avant la séance, entre 1 et 5, facultative. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodBefore?: number;

  /** Humeur après la séance, entre 1 et 5, facultative. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodAfter?: number;

  /** Notes textuelles optionnelles associées à la séance. */
  @IsOptional()
  @IsString()
  notes?: string;
}
