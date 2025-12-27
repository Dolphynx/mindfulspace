import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from "class-validator";
import { MeditationSessionSource, MeditationMode } from "@prisma/client";

/**
 * DTO de création d'une séance de méditation.
 *
 * @remarks
 * Ce DTO doit rester aligné avec le contrat API existant :
 * le service attend `dateSession` au format `YYYY-MM-DD`.
 */
export class CreateMeditationSessionDto {
  /**
   * Date de la séance (format `YYYY-MM-DD`).
   *
   * @remarks
   * - Aligné avec l'existant (`dto.dateSession`).
   * - Validation stricte "jour" (pas de timestamp ISO complet).
   */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dateSession must be in YYYY-MM-DD format",
  })
  dateSession!: string;

  /** Durée de la séance en secondes. */
  @IsInt()
  @Min(1)
  durationSeconds!: number;

  /** Identifiant du type de méditation. */
  @IsString()
  meditationTypeId!: string;

  /** Identifiant du contenu de méditation (optionnel). */
  @IsOptional()
  @IsString()
  meditationContentId?: string;

  /** Source de la séance (optionnelle). */
  @IsOptional()
  @IsEnum(MeditationSessionSource)
  source?: MeditationSessionSource;

  /** Humeur avant la séance, entre 1 et 5 (optionnelle). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodBefore?: number;

  /** Humeur après la séance, entre 1 et 5 (optionnelle). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodAfter?: number;

  /** Notes optionnelles associées à la séance. */
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO de contenu de méditation renvoyé au client.
 *
 * @remarks
 * `mediaUrl` est l’URL finale à consommer côté front (déjà résolue si provider externe).
 */
export class MeditationContentDto {
  /** Identifiant du contenu. */
  id!: string;

  /** Titre affiché. */
  title!: string;

  /** Description (optionnelle). */
  description?: string | null;

  /** Mode de contenu (AUDIO, VIDEO, VISUAL, TIMER, etc.). */
  mode!: MeditationMode;

  /** Durée par défaut en secondes. */
  durationSeconds!: number;

  /** Identifiant du type de méditation associé. */
  meditationTypeId!: string;

  /** Indique si le contenu est réservé premium. */
  isPremium!: boolean;

  /**
   * URL finale du média.
   *
   * @remarks
   * - Si un mp3 direct est défini: URL directe.
   * - Si un provider externe est configuré: URL de stream résolue.
   * - Sinon: `null`.
   */
  mediaUrl!: string | null;
}
