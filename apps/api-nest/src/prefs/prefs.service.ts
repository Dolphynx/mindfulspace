/**
 * PrefsService
 * ------------
 * Service applicatif pour la gestion des préférences utilisateur MindfulSpace.
 *
 * Rôle :
 * - Charger des préférences depuis un fichier JSON statique.
 * - Fournir une API simple pour lire / modifier ces préférences en mémoire.
 *
 * Remarque :
 * - Dans cette version, les préférences sont stockées en mémoire (et initialisées
 *   depuis `user-prefs.json`). Il n’y a pas encore de persistance en BDD.
 */

import { Injectable } from "@nestjs/common";
import prefsData from "../data/user-prefs.json"; // import statique

/**
 * Représentation TypeScript du fichier de préférences.
 * - Facilite l’auto-complétion et la sécurité de type.
 */
type PrefsFile = {
  launchBreathingOnStart: boolean;
};

@Injectable()
export class PrefsService {
  /**
   * État courant des préférences en mémoire.
   */
  private prefs: PrefsFile;

  /**
   * Constructeur :
   * - Initialise les préférences à partir du fichier JSON.
   * - Assure une valeur par défaut si la clé n’est pas définie ou mal typée.
   */
  constructor() {
    const data = (prefsData as Partial<PrefsFile>) ?? {};
    this.prefs = {
      launchBreathingOnStart:
        typeof data.launchBreathingOnStart === "boolean"
          ? data.launchBreathingOnStart
          : true,
    };
  }

  /**
   * Retourne l’état actuel des préférences.
   *
   * @returns {PrefsFile} l’objet complet des préférences.
   */
  getPrefs(): PrefsFile {
    return this.prefs;
  }

  /**
   * Met à jour la préférence `launchBreathingOnStart` et renvoie le nouvel état.
   *
   * @param value - Nouvelle valeur booléenne (true/false).
   * @returns {PrefsFile} l’objet de préférences après mise à jour.
   */
  toggleLaunchBreathing(value: boolean): PrefsFile {
    this.prefs = { ...this.prefs, launchBreathingOnStart: !!value };
    return this.prefs;
  }
}
