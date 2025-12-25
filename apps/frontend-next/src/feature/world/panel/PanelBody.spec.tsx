import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

/**
 * Tests unitaires de PanelBody.
 *
 * @remarks
 * PanelBody est un routeur interne : il rend une vue selon `currentView.type`.
 * On ne teste pas la logique des vues (elles sont mockées), uniquement :
 * - le mapping type -> composant rendu,
 * - le fallback (overview),
 * - la transmission du paramètre `domain` à DomainDetailView.
 */

// -----------------------------------------------------------------------------
// Mock du WorldHub (source de currentView)
// -----------------------------------------------------------------------------

type CurrentViewMock =
    | { type: "overview" }
    | { type: "badges" }
    | { type: "quickLog" }
    | { type: "startSession" }
    | { type: "programs" }
    | { type: "domainDetail"; domain: "sleep" | "meditation" | "exercise" };

const mockUseWorldHub = jest.fn(() => ({
    currentView: { type: "overview" } as CurrentViewMock,
}));

jest.mock("../hub/WorldHubProvider", () => ({
    __esModule: true,
    useWorldHub: () => mockUseWorldHub(),
}));

// -----------------------------------------------------------------------------
// Mocks des vues (composants lourds / hooks / next/navigation)
// -----------------------------------------------------------------------------

jest.mock("../views/overview/OverviewView", () => ({
    __esModule: true,
    OverviewView: () => <div data-testid="overview-view" />,
}));

jest.mock("../views/badges/BadgesView", () => ({
    __esModule: true,
    BadgesView: () => <div data-testid="badges-view" />,
}));

jest.mock("../views/quicklog/QuickLogView", () => ({
    __esModule: true,
    QuickLogView: () => <div data-testid="quicklog-view" />,
}));

jest.mock("../views/startSession/StartSessionView", () => ({
    __esModule: true,
    StartSessionView: () => <div data-testid="startsession-view" />,
}));

jest.mock("../views/programs/ProgramsView", () => ({
    __esModule: true,
    ProgramsView: () => <div data-testid="programs-view" />,
}));

/**
 * DomainDetailView doit être un jest.fn pour vérifier la prop `domain`.
 */
const mockDomainDetailView = jest.fn(
    (_props: { domain: "sleep" | "meditation" | "exercise" }) => (
        <div data-testid="domain-detail-view" />
    ),
);

jest.mock("../views/domainDetail/DomainDetailView", () => ({
    __esModule: true,
    DomainDetailView: (props: { domain: "sleep" | "meditation" | "exercise" }) =>
        mockDomainDetailView(props),
}));

// -----------------------------------------------------------------------------
// Module testé
// -----------------------------------------------------------------------------
import { PanelBody } from "./PanelBody";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("PanelBody (World Hub)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("rend OverviewView par défaut (currentView=overview)", () => {
        mockUseWorldHub.mockReturnValue({ currentView: { type: "overview" } });

        render(<PanelBody />);

        expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    });

    test("rend BadgesView quand currentView.type=badges", () => {
        mockUseWorldHub.mockReturnValue({ currentView: { type: "badges" } });

        render(<PanelBody />);

        expect(screen.getByTestId("badges-view")).toBeInTheDocument();
    });

    test("rend QuickLogView quand currentView.type=quickLog", () => {
        mockUseWorldHub.mockReturnValue({ currentView: { type: "quickLog" } });

        render(<PanelBody />);

        expect(screen.getByTestId("quicklog-view")).toBeInTheDocument();
    });

    test("rend StartSessionView quand currentView.type=startSession", () => {
        mockUseWorldHub.mockReturnValue({ currentView: { type: "startSession" } });

        render(<PanelBody />);

        expect(screen.getByTestId("startsession-view")).toBeInTheDocument();
    });

    test("rend ProgramsView quand currentView.type=programs", () => {
        mockUseWorldHub.mockReturnValue({ currentView: { type: "programs" } });

        render(<PanelBody />);

        expect(screen.getByTestId("programs-view")).toBeInTheDocument();
    });

    test("rend DomainDetailView et lui transmet `domain` quand currentView.type=domainDetail", () => {
        mockUseWorldHub.mockReturnValue({
            currentView: { type: "domainDetail", domain: "sleep" },
        });

        render(<PanelBody />);

        expect(screen.getByTestId("domain-detail-view")).toBeInTheDocument();
        expect(mockDomainDetailView).toHaveBeenCalledWith(
            expect.objectContaining({ domain: "sleep" }),
        );
    });

    test("fallback : rend OverviewView si currentView.type inattendu", () => {
        // On simule un cas impossible côté type (mais possible en runtime si bug)
        mockUseWorldHub.mockReturnValue({
            currentView: { type: "__unknown__" } as unknown as CurrentViewMock,
        });

        render(<PanelBody />);

        expect(screen.getByTestId("overview-view")).toBeInTheDocument();
    });
});
