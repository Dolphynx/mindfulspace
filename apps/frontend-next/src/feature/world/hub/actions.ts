/**
 * @file actions.ts
 * @description
 * Créateurs d’actions pour le reducer du World Hub.
 *
 * Ce module centralise les wrappers de dispatch afin de :
 * - fournir une API d’actions fortement typée,
 * - isoler la logique de dispatch du provider,
 * - garantir une cohérence entre les actions exposées et le reducer.
 */

import type { Dispatch } from "react";
import type { Domain, WorldAction } from "./types";

/**
 * Type du dispatch utilisé par le reducer du World Hub.
 *
 * Il est volontairement restreint à `WorldAction` afin de garantir
 * que seules les actions connues du reducer puissent être émises.
 */
export type WorldDispatch = Dispatch<WorldAction>;

/**
 * Ensemble des actions exposées par le World Hub.
 *
 * Chaque action correspond à une intention métier claire
 * (navigation interne, ouverture/fermeture de panneau, etc.)
 * et encapsule l’appel au `dispatch`.
 */
export type WorldHubActions = {
    /** Ouvre la vue d’overview du World Hub. */
    openOverviewAction: () => void;

    /** Ouvre la vue listant les badges. */
    openBadgesAction: () => void;

    /**
     * Ouvre la vue de détail d’un domaine donné.
     *
     * @param domain - Domaine à afficher.
     */
    openDomainDetailAction: (domain: Domain) => void;

    /**
     * Ouvre le panneau de saisie rapide (quick log).
     *
     * @param domain - Domaine ciblé (optionnel).
     */
    openQuickLogAction: (domain?: Domain) => void;

    /**
     * Ouvre l’écran de démarrage de session.
     *
     * Le domaine `sleep` est exclu au niveau du typage,
     * car il ne supporte pas ce flux.
     *
     * @param domain - Domaine ciblé (optionnel, hors `sleep`).
     */
    openStartSessionAction: (domain?: Exclude<Domain, "sleep">) => void;

    /** Ouvre la vue des programmes. */
    openProgramsAction: () => void;

    /** Navigue vers l’état précédent dans l’historique interne du hub. */
    goBackAction: () => void;

    /** Ferme explicitement le panneau (drawer/overlay). */
    closePanelAction: () => void;

    /** Ouvre explicitement le panneau (drawer/overlay). */
    openPanelAction: () => void;
};

/**
 * Construit l’ensemble des actions du World Hub à partir du `dispatch`.
 *
 * Cette fonction :
 * - encapsule les types d’actions du reducer,
 * - fournit une API stable aux consommateurs du contexte,
 * - évite la duplication de `dispatch({ type: ... })` dans l’UI.
 *
 * @param dispatch - Fonction de dispatch du reducer World Hub.
 * @returns Objet contenant les actions prêtes à l’emploi.
 */
export function createWorldHubActions(dispatch: WorldDispatch): WorldHubActions {
    const openOverviewAction = () => dispatch({ type: "OPEN_OVERVIEW" });
    const openBadgesAction = () => dispatch({ type: "OPEN_BADGES" });

    const openDomainDetailAction = (domain: Domain) =>
        dispatch({ type: "OPEN_DOMAIN_DETAIL", domain });

    const openQuickLogAction = (domain?: Domain) =>
        dispatch({ type: "OPEN_QUICKLOG", domain });

    const openStartSessionAction = (domain?: Exclude<Domain, "sleep">) =>
        dispatch({ type: "OPEN_STARTSESSION", domain });

    /**
     * Le reducer garantit un domaine par défaut (ex. `"exercise"`)
     * lorsque aucun domaine n’est explicitement fourni.
     */
    const openProgramsAction = () => dispatch({ type: "OPEN_PROGRAMS" });

    const goBackAction = () => dispatch({ type: "GO_BACK" });

    const closePanelAction = () => dispatch({ type: "CLOSE_PANEL" });

    const openPanelAction = () => dispatch({ type: "OPEN_PANEL" });

    return {
        openOverviewAction,
        openBadgesAction,
        openDomainDetailAction,
        openQuickLogAction,
        openStartSessionAction,
        openProgramsAction,
        goBackAction,
        closePanelAction,
        openPanelAction,
    };
}
