/**
 * @file types.ts
 * @description
 * Types for the World Hub state machine (world-v2).
 */

export type Domain = "sleep" | "meditation" | "exercise";

export type DrawerView =
    | { type: "overview" }
    | { type: "badges" }
    | { type: "quickLog"; domain?: Domain }
    | { type: "startSession"; domain?: Exclude<Domain, "sleep"> }
    | { type: "programs"; domain?: "exercise" }
    | { type: "domainDetail"; domain: Domain };

export type WorldState = {
    isPanelOpen: boolean;
    drawerStack: DrawerView[];
};

export type WorldAction =
    | { type: "OPEN_PANEL" }
    | { type: "CLOSE_PANEL" }
    | { type: "OPEN_OVERVIEW" }
    | { type: "OPEN_BADGES" }
    | { type: "OPEN_DOMAIN_DETAIL"; domain: Domain }
    | { type: "OPEN_QUICKLOG"; domain?: Domain }
    | { type: "OPEN_STARTSESSION"; domain?: Exclude<Domain, "sleep"> }
    | { type: "OPEN_PROGRAMS"; domain?: "exercise" }
    | { type: "GO_BACK" };
