import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// -----------------------------------------------------------------------------
// Mocks des dépendances internes du hub
// -----------------------------------------------------------------------------

/**
 * État initial mocké (forme minimale).
 *
 * @remarks
 * On ne connaît pas forcément toute la structure de WorldState ici.
 * On garde donc un objet simple typé en `unknown`, et on vérifie surtout
 * le câblage Provider -> selectors/actions.
 */
const mockInitialState: unknown = {
    isPanelOpen: false,
    drawerStack: ["root"],
};

/**
 * Mock du reducer et de l'init.
 *
 * @remarks
 * - createInitialWorldState renvoie un état stable.
 * - worldReducer : pass-through (ne change rien).
 */
jest.mock("./reducer", () => ({
    __esModule: true,
    createInitialWorldState: jest.fn(() => mockInitialState),
    worldReducer: jest.fn((state: unknown) => state),
}));

/**
 * Mock des selectors : IMPORTANT
 * Ils doivent accepter un argument (state) sinon TS2554.
 */
const mockSelectCurrentView = jest.fn((_state: unknown) => "overview");
const mockSelectCanGoBack = jest.fn((_state: unknown) => false);

jest.mock("./selectors", () => ({
    __esModule: true,
    selectCurrentView: (state: unknown) => mockSelectCurrentView(state),
    selectCanGoBack: (state: unknown) => mockSelectCanGoBack(state),
}));

/**
 * Mock des actions exposées via createWorldHubActions.
 */
const mockActions = {
    openOverviewAction: jest.fn(),
    openBadgesAction: jest.fn(),
    openDomainDetailAction: jest.fn(),
    openQuickLogAction: jest.fn(),
    openStartSessionAction: jest.fn(),
    openProgramsAction: jest.fn(),
    goBackAction: jest.fn(),
    closePanelAction: jest.fn(),
    openPanelAction: jest.fn(),
};

jest.mock("./actions", () => ({
    __esModule: true,
    createWorldHubActions: jest.fn(() => mockActions),
}));

// -----------------------------------------------------------------------------
// Module testé
// -----------------------------------------------------------------------------
import { WorldHubProvider, useWorldHub } from "./WorldHubProvider";
import type { Domain } from "./types";

// -----------------------------------------------------------------------------
// Composant consommateur pour tester le hook
// -----------------------------------------------------------------------------

function Consumer() {
    const hub = useWorldHub();

    return (
        <div>
            <div data-testid="refreshKey">{hub.refreshKey}</div>
            <div data-testid="currentView">{String(hub.currentView)}</div>
            <div data-testid="canGoBack">{String(hub.canGoBack)}</div>

            <button type="button" onClick={hub.bumpRefreshKey}>
                bumpRefreshKey
            </button>

            <button type="button" onClick={hub.openPanel}>
                openPanel
            </button>
            <button type="button" onClick={hub.closePanel}>
                closePanel
            </button>
            <button type="button" onClick={hub.goBack}>
                goBack
            </button>

            <button type="button" onClick={hub.openOverview}>
                openOverview
            </button>
            <button type="button" onClick={hub.openBadges}>
                openBadges
            </button>

            {/* On cast en Domain sans utiliser `any` */}
            <button
                type="button"
                onClick={() => hub.openDomain("exercise" as unknown as Domain)}
            >
                openDomain
            </button>

            <button
                type="button"
                onClick={() => hub.openDomainDetail("meditation" as unknown as Domain)}
            >
                openDomainDetail
            </button>

            <button
                type="button"
                onClick={() => hub.openQuickLog("sleep" as unknown as Domain)}
            >
                openQuickLog
            </button>

            <button
                type="button"
                onClick={() => hub.openStartSession("meditation" as unknown as Exclude<Domain, "sleep">)}
            >
                openStartSession
            </button>

            <button type="button" onClick={hub.openPrograms}>
                openPrograms
            </button>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("WorldHubProvider / useWorldHub", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("useWorldHub lève une erreur explicite hors provider", () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<Consumer />)).toThrow(
            "useWorldHub must be used within WorldHubProvider",
        );

        spy.mockRestore();
    });

    test("le Provider expose currentView et canGoBack via les selectors", () => {
        render(
            <WorldHubProvider>
                <Consumer />
            </WorldHubProvider>,
        );

        expect(mockSelectCurrentView).toHaveBeenCalledTimes(1);
        expect(mockSelectCanGoBack).toHaveBeenCalledTimes(1);

        expect(screen.getByTestId("currentView")).toHaveTextContent("overview");
        expect(screen.getByTestId("canGoBack")).toHaveTextContent("false");
    });

    test("bumpRefreshKey incrémente refreshKey", async () => {
        const user = userEvent.setup();

        render(
            <WorldHubProvider>
                <Consumer />
            </WorldHubProvider>,
        );

        expect(screen.getByTestId("refreshKey")).toHaveTextContent("0");

        await user.click(screen.getByRole("button", { name: "bumpRefreshKey" }));
        expect(screen.getByTestId("refreshKey")).toHaveTextContent("1");

        await user.click(screen.getByRole("button", { name: "bumpRefreshKey" }));
        expect(screen.getByTestId("refreshKey")).toHaveTextContent("2");
    });

    test("les actions exposées sont bien celles de createWorldHubActions()", async () => {
        const user = userEvent.setup();

        render(
            <WorldHubProvider>
                <Consumer />
            </WorldHubProvider>,
        );

        await user.click(screen.getByRole("button", { name: "openPanel" }));
        expect(mockActions.openPanelAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "closePanel" }));
        expect(mockActions.closePanelAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "goBack" }));
        expect(mockActions.goBackAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "openOverview" }));
        expect(mockActions.openOverviewAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "openBadges" }));
        expect(mockActions.openBadgesAction).toHaveBeenCalledTimes(1);

        // openDomain est un alias vers openDomainDetailAction dans le provider
        await user.click(screen.getByRole("button", { name: "openDomain" }));
        expect(mockActions.openDomainDetailAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "openDomainDetail" }));
        expect(mockActions.openDomainDetailAction).toHaveBeenCalledTimes(2);

        await user.click(screen.getByRole("button", { name: "openQuickLog" }));
        expect(mockActions.openQuickLogAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "openStartSession" }));
        expect(mockActions.openStartSessionAction).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "openPrograms" }));
        expect(mockActions.openProgramsAction).toHaveBeenCalledTimes(1);
    });

    test("l'état initial provient de createInitialWorldState()", () => {
        render(
            <WorldHubProvider>
                <Consumer />
            </WorldHubProvider>,
        );

        // On récupère le mock du module reducer pour vérifier l’appel
        const reducerModule = jest.requireMock("./reducer") as {
            createInitialWorldState: jest.Mock;
        };

        expect(reducerModule.createInitialWorldState).toHaveBeenCalledTimes(1);
    });
});
