"use client";

/**
 * @file PanelBody.tsx
 * @description
 * Routeur interne du contenu du panneau (drawer) du World Hub (SPA world-v2).
 *
 * Ce module se base sur la vue courante exposée par `WorldHubProvider`
 * afin de rendre le composant correspondant.
 *
 * Objectifs :
 * - Centraliser le mapping `DrawerView -> ReactElement`.
 * - Garder les vues métier découplées de la mécanique de routing interne.
 * - Limiter la logique dans les composants d’UI (un seul point de décision).
 */

import { useWorldHub } from "../hub/WorldHubProvider";

import { OverviewView } from "../views/overview/OverviewView";
import { BadgesView } from "../views/badges/BadgesView";
import { QuickLogView } from "../views/quicklog/QuickLogView";
import { StartSessionView } from "../views/startSession/StartSessionView";
import { ProgramsView } from "../views/programs/ProgramsView";
import { DomainDetailView } from "../views/domainDetail/DomainDetailView";

/**
 * Résout la vue à rendre dans le panneau en fonction de la vue courante.
 *
 * Le type de `currentView` est dérivé de l’API du hub afin de :
 * - rester synchronisé avec `WorldHubProvider` sans dupliquer les types,
 * - bénéficier d’un typage exhaustif basé sur `currentView.type`.
 *
 * @param currentView - Vue courante du drawer (sommet de pile).
 * @returns Élément React correspondant à la vue courante.
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
 * Corps du panneau (drawer) du World Hub.
 *
 * Rôle :
 * - Récupérer la vue courante depuis le contexte.
 * - Déléguer le rendu au routeur interne `renderPanelBody`.
 *
 * @returns Contenu du panneau correspondant à la vue courante.
 */
export function PanelBody() {
    const { currentView } = useWorldHub();
    return renderPanelBody(currentView);
}
