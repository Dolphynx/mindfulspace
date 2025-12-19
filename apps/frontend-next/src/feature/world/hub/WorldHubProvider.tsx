"use client";

/**
 * @file WorldHubProvider.tsx
 * @description
 * World Hub context provider for the world-v2 SPA.
 *
 * Responsibilities:
 * - Own the World Hub reducer state (panel open state and drawer stack).
 * - Expose a stable API for navigation actions within the SPA panel.
 * - Provide a global refresh signal to allow consumers to re-fetch data when needed.
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
    useState,
} from "react";

import { createInitialWorldState, worldReducer } from "./reducer";
import type { Domain, DrawerView, WorldState } from "./types";
import { createWorldHubActions } from "./actions";
import { selectCanGoBack, selectCurrentView } from "./selectors";

export type WorldHubApi = {
    state: WorldState;
    currentView: DrawerView;
    canGoBack: boolean;

    refreshKey: number;
    bumpRefreshKey: () => void;

    openOverview: () => void;
    openBadges: () => void;

    /**
     * Opens a domain screen.
     *
     * Alias of {@link openDomainDetail}. This method exists for compatibility with earlier
     * code paths that called `openDomain(domain)`. The current world-v2 reducer and view
     * stack only support domain navigation through the domain detail view type.
     *
     * @param domain - Domain identifier.
     */
    openDomain: (domain: Domain) => void;

    openDomainDetail: (domain: Domain) => void;

    openQuickLog: (domain?: Domain) => void;
    openStartSession: (domain?: Exclude<Domain, "sleep">) => void;

    openPrograms: () => void;

    goBack: () => void;

    closePanel: () => void;
    openPanel: () => void;
};

const WorldHubContext = createContext<WorldHubApi | null>(null);

export function WorldHubProvider(props: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(worldReducer, undefined, createInitialWorldState);

    const [refreshKey, setRefreshKey] = useState(0);

    const bumpRefreshKey = useCallback(() => {
        setRefreshKey((v) => v + 1);
    }, []);

    const actions = useMemo(() => createWorldHubActions(dispatch), [dispatch]);

    const currentView = useMemo(() => selectCurrentView(state), [state]);
    const canGoBack = useMemo(() => selectCanGoBack(state), [state]);

    const value = useMemo<WorldHubApi>(
        () => ({
            state,
            currentView,
            canGoBack,
            refreshKey,
            bumpRefreshKey,

            openOverview: actions.openOverviewAction,
            openBadges: actions.openBadgesAction,

            openDomain: actions.openDomainDetailAction,
            openDomainDetail: actions.openDomainDetailAction,

            openQuickLog: actions.openQuickLogAction,
            openStartSession: actions.openStartSessionAction,
            openPrograms: actions.openProgramsAction,

            goBack: actions.goBackAction,

            closePanel: actions.closePanelAction,
            openPanel: actions.openPanelAction,
        }),
        [state, currentView, canGoBack, refreshKey, bumpRefreshKey, actions],
    );

    return <WorldHubContext.Provider value={value}>{props.children}</WorldHubContext.Provider>;
}

export function useWorldHub(): WorldHubApi {
    const v = useContext(WorldHubContext);
    if (!v) throw new Error("useWorldHub must be used within WorldHubProvider");
    return v;
}

export function useWorldHubOptional(): WorldHubApi | null {
    return useContext(WorldHubContext);
}
