/**
 * PrefsService
 * ------------
 * Service applicatif pour la gestion des préférences utilisateur MindfulSpace.
 *
 * @remarks
 * Ce service a été introduit lors d’une phase de prototypage afin de
 * simuler des préférences utilisateur et tester certains parcours
 * fonctionnels (ex. lancement automatique d’une séance de respiration).
 *
 * La fonctionnalité associée a ensuite été abandonnée, mais le service
 * est conservé afin de :
 * - documenter les choix explorés durant le développement,
 * - maintenir une cohérence avec l’API exposée,
 * - servir de base si un système de préférences persistées
 *   (BDD) est réintroduit ultérieurement.
 *
 * Dans cette version, les préférences sont stockées en mémoire et
 * initialisées depuis un fichier JSON statique (`user-prefs.json`).
 * Il n’y a volontairement pas de persistance en base de données.
 */

import { Injectable } from "@nestjs/common";
import prefsData from "../data/user-prefs.json"; // import statique (phase de prototypage)

/**
 * Représentation TypeScript du fichier de préférences.
 *
 * @remarks
 * Type utilisé pour sécuriser les accès aux données simulées
 * et faciliter une éventuelle évolution du modèle de préférences.
 */
type PrefsFile = {
  launchBreathingOnStart: boolean;
};

@Injectable()
export class PrefsService {
  /**
   * État courant des préférences en mémoire.
   *
   * @remarks
   * État non persisté, volontairement simple, utilisé dans le cadre
   * de tests fonctionnels et de démonstration.
   */
  private prefs: PrefsFile;

  /**
   * Constructeur
   *
   * @remarks
   * Initialise les préférences à partir du fichier JSON statique.
   * Des valeurs par défaut sont appliquées afin de garantir un état
   * cohérent, même si le fichier évolue ou est partiellement défini.
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
   * @returns L’objet complet des préférences utilisateur simulées.
   */
  getPrefs(): PrefsFile {
    return this.prefs;
  }

  /**
   * Met à jour la préférence `launchBreathingOnStart` et renvoie le nouvel état.
   *
   * @remarks
   * Cette méthode faisait partie du scénario de test initial permettant
   * de modifier dynamiquement une préférence durant la phase de prototypage.
   *
   * @param value - Nouvelle valeur booléenne.
   * @returns L’objet de préférences après mise à jour.
   */
  toggleLaunchBreathing(value: boolean): PrefsFile {
    this.prefs = { ...this.prefs, launchBreathingOnStart: !!value };
    return this.prefs;
  }
}
