import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO représentant un badge mis en avant pour un utilisateur,
 * tel que consommé par l’endpoint `/badges/me/highlighted`.
 */
export class HighlightedBadgeDto {
  @ApiProperty({
    description: "Identifiant de l'instance de badge utilisateur (userBadge).",
    example: "ubg_123456",
  })
  id!: string;

  @ApiProperty({
    description: "Identifiant de la définition du badge.",
    example: "bdg_zen_10",
  })
  badgeId!: string;

  @ApiProperty({
    description: "Date et heure d'obtention du badge.",
    type: String,
    format: "date-time",
    example: "2025-12-10T08:30:00.000Z",
  })
  earnedAt!: Date;

  @ApiProperty({
    description: "Slug technique du badge.",
    example: "first-meditation",
  })
  slug!: string;

  @ApiProperty({
    description: "Clé i18n du titre du badge.",
    example: "badges.firstMeditation.title",
  })
  titleKey!: string;

  @ApiProperty({
    description: "Clé i18n de la description du badge.",
    example: "badges.firstMeditation.description",
    required: false,
    nullable: true,
  })
  descriptionKey!: string | null;

  @ApiProperty({
    description: "Nom de fichier de l'icône du badge.",
    example: "first-meditation.png",
    required: false,
    nullable: true,
  })
  iconKey!: string | null;
}

/**
 * DTO simplifié pour la définition d'un badge,
 * utilisé dans la liste complète des badges utilisateur.
 */
export class BadgeDefinitionDto {
  @ApiProperty({
    description: "Identifiant de la définition de badge.",
    example: "bdg_zen_10",
  })
  id!: string;

  @ApiProperty({
    description: "Slug technique du badge.",
    example: "zen-10",
  })
  slug!: string;

  @ApiProperty({
    description: "Clé i18n du titre du badge.",
    example: "badges.zen10.title",
  })
  titleKey!: string;

  @ApiProperty({
    description: "Clé i18n de la description du badge.",
    example: "badges.zen10.description",
    required: false,
    nullable: true,
  })
  descriptionKey!: string | null;

  @ApiProperty({
    description: "Nom de fichier de l'icône du badge.",
    example: "zen-10.png",
    required: false,
    nullable: true,
  })
  iconKey!: string | null;
}

/**
 * DTO représentant un badge utilisateur avec sa définition associée,
 * tel que retourné par `getUserBadges`.
 */
export class UserBadgeDto {
  @ApiProperty({
    description: "Identifiant de l'instance de badge utilisateur.",
    example: "ubg_123456",
  })
  id!: string;

  @ApiProperty({
    description: "Identifiant de l'utilisateur.",
    example: "usr_42",
  })
  userId!: string;

  @ApiProperty({
    description: "Identifiant de la définition de badge.",
    example: "bdg_zen_10",
  })
  badgeId!: string;

  @ApiProperty({
    description: "Date et heure d'obtention du badge.",
    type: String,
    format: "date-time",
    example: "2025-12-10T08:30:00.000Z",
  })
  earnedAt!: Date;

  @ApiProperty({
    description: "Valeur de la métrique au moment de l'obtention du badge.",
    example: 10,
  })
  metricValueAtEarn!: number;

  @ApiProperty({
    description: "Définition associée au badge utilisateur.",
    type: () => BadgeDefinitionDto,
  })
  badge!: BadgeDefinitionDto;
}
