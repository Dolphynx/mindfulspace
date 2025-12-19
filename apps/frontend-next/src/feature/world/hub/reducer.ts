// src/components/world/state/reducer.ts

import type { WorldAction, WorldState } from "./types";

export function createInitialWorldState(): WorldState {
    return {
        isPanelOpen: false,
        drawerStack: [{ type: "overview" }],
    };
}

export function worldReducer(state: WorldState, action: WorldAction): WorldState {
    switch (action.type) {
        case "OPEN_PANEL":
            return { ...state, isPanelOpen: true };

        case "CLOSE_PANEL":
            return {
                ...state,
                isPanelOpen: false,
                drawerStack: [{ type: "overview" }],
            };

        case "OPEN_OVERVIEW":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [{ type: "overview" }],
            };

        case "OPEN_BADGES":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [{ type: "overview" }, { type: "badges" }],
            };

        case "OPEN_DOMAIN_DETAIL":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    { type: "domainDetail", domain: action.domain },
                ],
            };

        case "OPEN_QUICKLOG":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "quickLog",
                        ...(action.domain ? { domain: action.domain } : {}),
                    },
                ],
            };

        case "OPEN_STARTSESSION":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "startSession",
                        ...(action.domain ? { domain: action.domain } : {}),
                    },
                ],
            };

        case "OPEN_PROGRAMS":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "programs",
                        ...(action.domain
                            ? { domain: action.domain }
                            : { domain: "exercise" }),
                    },
                ],
            };

        case "GO_BACK": {
            if (state.drawerStack.length <= 1) return state;
            return { ...state, drawerStack: state.drawerStack.slice(0, -1) };
        }

        default:
            return state;
    }
}
