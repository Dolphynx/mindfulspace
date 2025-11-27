/**
 * TipsService
 * -----------
 * Service applicatif responsable de la gestion des "astuces bien-être".
 *
 * Rôle :
 * - Charger une liste d’astuces depuis un fichier JSON statique.
 * - Fournir une méthode `getRandomTip(locale?)` qui renvoie une astuce aléatoire
 *   en fonction de la locale (fr/en/…).
 *
 * Remarque :
 * - Les locales supportées sont déduites dynamiquement depuis tips.json.
 */

import { Injectable } from '@nestjs/common';
import tipsData from '../data/tips.json'; // import statique

type TipsFile = {
  tips: string[];
};

type TipsFileByLocale = {
  [locale: string]: TipsFile | undefined;
};

@Injectable()
export class TipsService {
  /**
   * Map locale → liste des astuces.
   * Exemple :
   * {
   *   fr: ["Astuce FR 1", "Astuce FR 2"],
   *   en: ["Tip EN 1", "Tip EN 2"],
   *   nl: ["Tip NL 1", ...]
   * }
   */
  private readonly tipsByLocale: Record<string, string[]> = {};

  /**
   * Locale par défaut utilisée comme fallback si la locale demandée
   * n’existe pas dans tips.json.
   */
  private readonly defaultLocale = 'fr';

  constructor() {
    const data = (tipsData as TipsFileByLocale) ?? {};

    for (const [locale, section] of Object.entries(data)) {
      if (section && Array.isArray(section.tips)) {
        this.tipsByLocale[locale] = section.tips;
      }
    }

    if (!Object.keys(this.tipsByLocale).length) {
      console.warn(
        'Aucun tip valide trouvé dans tips.json (import statique, toutes locales confondues)',
      );
    }
  }

  /**
   * Normalisation de la locale :
   * - on ne garde que la partie avant le "-": "fr-BE" -> "fr"
   * - tout en lowercase
   */
  private normalizeLocale(locale?: string): string | undefined {
    if (!locale) return undefined;
    return locale.split('-')[0].toLowerCase();
  }

  /**
   * Renvoie une astuce aléatoire pour une locale donnée.
   *
   * @param locale Locale demandée (ex: "fr", "en", "fr-BE").
   */
  getRandomTip(locale?: string): string {
    const normalized = this.normalizeLocale(locale);

    let targetLocale =
      (normalized && this.tipsByLocale[normalized] ? normalized : undefined) ??
      (this.tipsByLocale[this.defaultLocale] ? this.defaultLocale : undefined);

    if (!targetLocale) {
      // Fallback ultime si même la defaultLocale n’existe pas
      const firstKey = Object.keys(this.tipsByLocale)[0];
      if (!firstKey) {
        return 'Prenez une grande respiration et souriez 🌿';
      }
      targetLocale = firstKey;
    }

    const list = this.tipsByLocale[targetLocale];
    if (!list || !list.length) {
      return 'Prenez une grande respiration et souriez 🌿';
    }

    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
}
