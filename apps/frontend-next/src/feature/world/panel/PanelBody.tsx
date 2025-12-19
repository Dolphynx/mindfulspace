"use client";

/**
 * @file PanelBody.tsx
 * @description
 * Panel router for the World Hub (SPA world-v2).
 *
 * This version removes the unused "domain" route and its placeholder view.
 * Behavior is unchanged as long as no code dispatches the "domain" view type.
 */

import { useWorldHub } from "../hub/WorldHubProvider";

import { OverviewView } from "../views/overview/OverviewView";
import { BadgesView } from "../views/badges/BadgesView";
import { QuickLogView } from "../views/quicklog/QuickLogView";
import { StartSessionView } from "../views/startSession/StartSessionView";
import { ProgramsView } from "../views/programs/ProgramsView";
import { DomainDetailView } from "../views/domainDetail/DomainDetailView";

/**
 * Resolves the view to render for the panel.
 *
 * @param currentView - The current drawer view.
 * @returns The React element for the current view.
 */
function renderPanelBody(currentView: ReturnType<typeof useWorldHub>["currentView"]) {
    switch (currentView.type) {
        case "badges":
            return <BadgesView />;

        case "quickLog":
            return <QuickLogView />;

        case "startSession":
            return <StartSessionView />;

        case "programs":
            return <ProgramsView />;

        case "domainDetail":
            return <DomainDetailView domain={currentView.domain} />;

        case "overview":
        default:
            return <OverviewView />;
    }
}

/**
 * Panel body component.
 *
 * @returns The panel body content for the current view.
 */
export function PanelBody() {
    const { currentView } = useWorldHub();
    return renderPanelBody(currentView);
}
