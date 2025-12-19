/**
 * @file actions.ts
 * @description
 * Action creators for the World Hub reducer.
 *
 * This module centralizes dispatch wrappers so that the provider stays focused on wiring.
 */

import type { Dispatch } from "react";
import type { Domain, WorldAction } from "./types";

/**
 * Strongly-typed dispatch function for the World Hub reducer.
 */
export type WorldDispatch = Dispatch<WorldAction>;

/**
 * Collection of dispatch-wrapped actions exposed by the World Hub.
 */
export type WorldHubActions = {
    openOverviewAction: () => void;
    openBadgesAction: () => void;

    openDomainDetailAction: (domain: Domain) => void;

    openQuickLogAction: (domain?: Domain) => void;
    openStartSessionAction: (domain?: Exclude<Domain, "sleep">) => void;

    openProgramsAction: () => void;

    goBackAction: () => void;

    closePanelAction: () => void;
    openPanelAction: () => void;
};

/**
 * Builds the set of dispatch-wrapped actions for the World Hub.
 *
 * @param dispatch - Reducer dispatch function.
 * @returns Action functions that dispatch the appropriate {@link WorldAction}.
 */
export function createWorldHubActions(dispatch: WorldDispatch): WorldHubActions {
    const openOverviewAction = () => dispatch({ type: "OPEN_OVERVIEW" });
    const openBadgesAction = () => dispatch({ type: "OPEN_BADGES" });

    const openDomainDetailAction = (domain: Domain) =>
        dispatch({ type: "OPEN_DOMAIN_DETAIL", domain });

    const openQuickLogAction = (domain?: Domain) => dispatch({ type: "OPEN_QUICKLOG", domain });

    const openStartSessionAction = (domain?: Exclude<Domain, "sleep">) =>
        dispatch({ type: "OPEN_STARTSESSION", domain });

    /**
     * The reducer ensures a default domain ("exercise") when none is provided.
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
