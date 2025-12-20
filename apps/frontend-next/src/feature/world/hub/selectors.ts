/**
 * @file selectors.ts
 * @description
 * Sélecteurs dérivant des informations à partir de l’état du World Hub.
 *
 * Les sélecteurs :
 * - centralisent les calculs dérivés récurrents,
 * - évitent la duplication de logique dans l’UI ou le provider,
 * - fournissent une API stable et testable autour de `WorldState`.
 */

import type { DrawerView, WorldState } from "./types";

/**
 * Sélectionne la vue courante du drawer.
 *
 * La vue courante correspond toujours au dernier élément de la pile
 * `drawerStack`, qui modélise l’historique de navigation interne du panneau.
 *
 * Invariant :
 * - `drawerStack` contient au minimum un élément (l’overview).
 *
 * @param state - État courant du World Hub.
 * @returns Vue actuellement affichée dans le drawer.
 */
export function selectCurrentView(state: WorldState): DrawerView {
    return state.drawerStack[state.drawerStack.length - 1];
}

/**
 * Indique si un retour arrière est possible dans la navigation interne.
 *
 * Un retour est possible uniquement lorsque la pile contient plus
 * d’un élément, l’overview constituant la racine non supprimable.
 *
 * @param state - État courant du World Hub.
 * @returns `true` si un retour arrière est autorisé, sinon `false`.
 */
export function selectCanGoBack(state: WorldState): boolean {
    return state.drawerStack.length > 1;
}
