/**
 * TipsService
 * -----------
 * Service applicatif responsable de la gestion des "astuces bien-être".
 *
 * @remarks
 * Ce service a été introduit lors d’une phase de prototypage afin de
 * tester l’intégration d’astuces bien-être dans l’application
 * (chargement de données, gestion de la locale, exposition via API).
 *
 * Les astuces sont actuellement chargées depuis un fichier JSON statique.
 * Cette approche a permis de valider :
 * - la structure des données,
 * - la gestion multilingue (i18n),
 * - et le flux complet backend → frontend,
 * avant l’intégration éventuelle d’un système de génération dynamique
 * basé sur l’IA.
 *
 * La génération d’astuces par IA n’a pas été implémentée dans cette
 * version du projet. Le service est conservé afin de :
 * - documenter les choix techniques explorés,
 * - maintenir une API fonctionnelle et cohérente,
 * - servir de base pour une évolution future.
 */

import { Injectable } from '@nestjs/common';
import tipsData from '../data/tips.json'; // import statique (phase de prototypage)

/**
 * Représentation du fichier JSON des astuces.
 *
 * @remarks
 * Typage utilisé pour sécuriser l’accès aux données statiques
 * et faciliter une éventuelle évolution du format.
 */
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
   *
   * @remarks
   * Les locales supportées sont déduites dynamiquement depuis le
   * fichier `tips.json`.
   *
   * Exemple :
   * {
   *   fr: ["Astuce FR 1", "Astuce FR 2"],
   *   en: ["Tip EN 1", "Tip EN 2"],
   * }
   */
  private readonly tipsByLocale: Record<string, string[]> = {};

  /**
   * Locale par défaut utilisée comme fallback si la locale demandée
   * n’est pas disponible dans les données statiques.
   */
  private readonly defaultLocale = 'fr';

  /**
   * Constructeur
   *
   * @remarks
   * Charge les astuces depuis le fichier JSON statique et initialise
   * la map interne par locale. Des contrôles simples sont appliqués
   * afin de garantir la cohérence des données chargées.
   */
  constructor() {
    const data = (tipsData as TipsFileByLocale) ?? {};

    for (const [locale, section] of Object.entries(data)) {
      if (section && Array.isArray(section.tips)) {
        this.tipsByLocale[locale] = section.tips;
      }
    }

    if (!Object.keys(this.tipsByLocale).length) {
      console.warn(
        'Aucune astuce valide trouvée dans tips.json (import statique, toutes locales confondues)',
      );
    }
  }

  /**
   * Normalise une locale reçue.
   *
   * @remarks
   * - Ne conserve que la partie avant le tiret : "fr-BE" → "fr"
   * - Convertit en minuscules pour garantir la cohérence des clés
   */
  private normalizeLocale(locale?: string): string | undefined {
    if (!locale) return undefined;
    return locale.split('-')[0].toLowerCase();
  }

  /**
   * Renvoie une astuce aléatoire pour une locale donnée.
   *
   * @remarks
   * Cette méthode a été utilisée durant la phase de prototypage
   * pour simuler la récupération d’astuces personnalisées,
   * sans dépendre d’un service externe ou d’une génération IA.
   *
   * @param locale Locale demandée (ex: "fr", "en", "fr-BE").
   * @returns Texte de l’astuce sélectionnée.
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
