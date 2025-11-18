/**
 * TipsService
 * -----------
 * Service applicatif responsable de la gestion des "astuces bien-être".
 *
 * Rôle :
 * - Charger une liste d’astuces depuis un fichier JSON statique.
 * - Fournir une méthode `getRandomTip()` qui renvoie une astuce aléatoire.
 *
 * Remarque :
 * - Dans cette version, les données proviennent d’un import statique `tips.json`.
 *   Il n’y a pas encore de persistance dans une base de données.
 */

import { Injectable } from '@nestjs/common';
import tipsData from '../data/tips.json'; // import statique

/**
 * Structure attendue du fichier tips.json.
 * Exemple :
 * {
 *   "tips": [
 *     "Pensez à respirer profondément trois fois de suite.",
 *     "Prenez une pause de 2 minutes loin des écrans."
 *   ]
 * }
 */
type TipsFile = {
  tips: string[];
};

@Injectable()
export class TipsService {
  /**
   * Liste des astuces chargées depuis le fichier JSON.
   */
  private tips: string[];

  /**
   * Constructeur :
   * - Initialise la liste `tips` à partir du contenu de tips.json.
   * - Applique un fallback (tableau vide) si la structure est invalide.
   * - Log un warning si aucun tip valide n’est trouvé.
   */
  constructor() {
    const data = (tipsData as TipsFile) ?? { tips: [] };
    this.tips = Array.isArray(data.tips) ? data.tips : [];
    if (!this.tips.length) {
      console.warn("Aucun tip valide trouvé dans tips.json (import statique)");
    }
  }

  /**
   * Renvoie une astuce aléatoire.
   *
   * - Si la liste est vide, retourne un message par défaut.
   * - Sinon, choisit un index aléatoire dans le tableau `tips`.
   *
   * @returns {string} Une phrase courte de type "conseil bien-être".
   */
  getRandomTip(): string {
    if (!this.tips.length) {
      return "Prenez une grande respiration et souriez 🌿";
    }
    const index = Math.floor(Math.random() * this.tips.length);

    return this.tips[index];
  }
}
