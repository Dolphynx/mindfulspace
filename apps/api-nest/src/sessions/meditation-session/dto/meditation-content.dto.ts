import type { MeditationMode } from '@prisma/client';

/**
 * DTO représentant un contenu de méditation "jouable" renvoyé au front.
 *
 * Ce modèle correspond exactement à l’objet exposé par l’API pour :
 * - les listings de contenus (`GET /meditation/contents`)
 * - les sélections dans le wizard de méditation
 *
 * Objectifs du DTO :
 * - Ne pas exposer l’entité Prisma brute.
 * - Garantir un contrat stable entre backend et frontend.
 * - S’aligner avec le schéma défini dans le PlantUML (structure publique).
 *
 * Notes :
 * - `meditationTypeId` est obtenu côté Prisma via `defaultMeditationTypeId`.
 * - Les durées min/max/default sont éventuellement nulles si non renseignées
 *   dans le catalogue.
 * - `mode` indique le type de player attendu (AUDIO, TIMER, VISUAL…).
 * - `isPremium` permet au front d’appliquer un badge ou une restriction.
 */
export class MeditationContentDto {
  /** Identifiant unique du contenu de méditation. */
  id!: string;

  /** Titre affiché dans les listes et étapes du wizard. */
  title!: string;

  /** Description courte ou nulle, selon le contenu. */
  description?: string | null;

  /**
   * Identifiant du type de méditation auquel ce contenu appartient.
   * Correspond à `defaultMeditationTypeId` côté Prisma.
   */
  meditationTypeId!: string;

  /** Mode de lecture : audio, timer, visuel, etc. */
  mode!: MeditationMode;

  /** Durée minimale supportée par ce contenu, si applicable. */
  minDurationSeconds?: number | null;

  /** Durée maximale supportée, si applicable. */
  maxDurationSeconds?: number | null;

  /** Durée par défaut recommandée pour ce contenu. */
  defaultDurationSeconds?: number | null;

  /** Ordre d’affichage (facultatif). */
  sortOrder?: number | null;

  /** Indique si le contenu est réservé aux utilisateurs premium. */
  isPremium!: boolean;
}
