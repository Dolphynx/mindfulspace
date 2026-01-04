import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

/**
 * Tests unitaires de la page World V2.
 *
 * @remarks
 * Ces tests valident le comportement de la page `/member/world-v2` en tant que
 * scène SPA unifiée (fusion de plusieurs pages historiques).
 *
 * La logique interne des composants lourds (map, hub, overlays) n’est pas testée ici :
 * ils sont volontairement mockés afin de se concentrer sur :
 * - le rendu conditionnel,
 * - les interactions utilisateur,
 * - la logique de navigation interne (drawer),
 * - la gestion de la locale.
 */

// -----------------------------------------------------------------------------
// Mocks Next.js / i18n
// -----------------------------------------------------------------------------

jest.mock("next/navigation", () => ({
    useParams: jest.fn(),
}));

jest.mock("@/i18n/TranslationContext", () => ({
    useTranslations: () => (key: string) => key,
}));

// -----------------------------------------------------------------------------
// Mock du hook WorldHub
// -----------------------------------------------------------------------------

type WorldHubStateMock = {
    isPanelOpen: boolean;
    drawerStack: unknown[];
};

type WorldHubApiMock = {
    state: WorldHubStateMock;
    openPanel: jest.Mock;
    closePanel: jest.Mock;
    goBack: jest.Mock;
};

const mockUseWorldHub = jest.fn<WorldHubApiMock, []>();

jest.mock("@/feature/world/hub/WorldHubProvider", () => ({
    __esModule: true,
    useWorldHub: () => mockUseWorldHub(),
}));

// -----------------------------------------------------------------------------
// Mocks des composants lourds (map, hub, overlays)
// -----------------------------------------------------------------------------

jest.mock("@/feature/world/app/WorldHubClient", () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="world-hub-client">{children}</div>
    ),
}));

jest.mock("@/feature/world/panel/PanelBody", () => ({
    PanelBody: () => <div data-testid="panel-body" />,
}));

jest.mock("@/components/badges/WorldBadgesLotusOverlay", () => ({
    WorldBadgesLotusOverlay: () => <div data-testid="badges-overlay" />,
}));

jest.mock("@/components/map/IslandMapLayers", () => ({
    IslandMapLayers: () => <div data-testid="map-layers" />,
}));

const mockMapMantra = jest.fn((props: { locale: string }) => (
    <div data-testid="map-mantra" />
));

jest.mock("@/components/map/MapMantra", () => ({
    __esModule: true,
    default: (props: { locale: string }) => mockMapMantra(props),
}));

// -----------------------------------------------------------------------------
// Page testée
// -----------------------------------------------------------------------------
import WorldV2Page from "../page";
import { useParams } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// -----------------------------------------------------------------------------
// Suite de tests
// -----------------------------------------------------------------------------

describe("World V2 page (/member/world-v2)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useParams as jest.Mock).mockReturnValue({ locale: "fr" });

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: false, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel: jest.fn(),
            goBack: jest.fn(),
        });
    });

    test("la page se rend sans crash", () => {
        render(<WorldV2Page />);
        expect(screen.getByTestId("world-hub-client")).toBeInTheDocument();
    });

    test("les overlays visuels sont montés (map + mantra + badges)", () => {
        render(<WorldV2Page />);
        expect(screen.getByTestId("map-layers")).toBeInTheDocument();
        expect(screen.getByTestId("map-mantra")).toBeInTheDocument();
        expect(screen.getByTestId("badges-overlay")).toBeInTheDocument();
    });

    test("le panneau principal n'est PAS affiché quand isPanelOpen=false", () => {
        render(<WorldV2Page />);
        expect(screen.queryByTestId("panel-body")).not.toBeInTheDocument();
    });

    test("le panneau principal est affiché quand isPanelOpen=true", () => {
        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: true, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel: jest.fn(),
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);
        expect(screen.getByTestId("panel-body")).toBeInTheDocument();
    });

    test("fallback sur la locale par défaut si locale invalide (ne crash pas)", () => {
        (useParams as jest.Mock).mockReturnValue({ locale: "xx" });

        render(<WorldV2Page />);
        expect(screen.getByTestId("world-hub-client")).toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Tests d’interaction SPA
    // -------------------------------------------------------------------------

    test("clic sur le CTA appelle openPanel()", async () => {
        const user = userEvent.setup();
        const openPanel = jest.fn();

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: false, drawerStack: ["root"] },
            openPanel,
            closePanel: jest.fn(),
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);

        // Il y a 2 CTA (desktop + mobile) dans le DOM lors des tests : on clique sur le premier.
        // => Deux CTA identiques (desktop + mobile) sont rendus simultanément en environnement de test
        // car les classes responsive CSS ne filtrent pas le DOM : on cible donc explicitement le premier.
        await user.click(screen.getAllByTestId("world-start-cta")[0]);

        expect(openPanel).toHaveBeenCalledTimes(1);
    });

    test("panel ouvert : clic sur le backdrop appelle closePanel()", async () => {
        const user = userEvent.setup();
        const closePanel = jest.fn();

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: true, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel,
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);
        await user.click(
            screen.getByRole("button", { name: "worldPanelCloseAria" }),
        );

        expect(closePanel).toHaveBeenCalledTimes(1);
    });

    test("panel ouvert : touche Escape appelle closePanel()", () => {
        const closePanel = jest.fn();

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: true, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel,
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);
        fireEvent.keyDown(document, { key: "Escape" });

        expect(closePanel).toHaveBeenCalledTimes(1);
    });

    test("bouton retour : visible seulement si drawerStack.length > 1 et appelle goBack()", async () => {
        const user = userEvent.setup();
        const goBack = jest.fn();

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: true, drawerStack: ["root", "child"] },
            openPanel: jest.fn(),
            closePanel: jest.fn(),
            goBack,
        });

        render(<WorldV2Page />);
        await user.click(
            screen.getByRole("button", { name: "worldPanelBackAria" }),
        );

        expect(goBack).toHaveBeenCalledTimes(1);
    });

    test("MapMantra reçoit la locale : fr (valide) / defaultLocale (fallback)", () => {
        (useParams as jest.Mock).mockReturnValue({ locale: "fr" });
        render(<WorldV2Page />);

        expect(mockMapMantra).toHaveBeenCalledWith(
            expect.objectContaining({ locale: "fr" }),
        );

        jest.clearAllMocks();
        (useParams as jest.Mock).mockReturnValue({ locale: "xx" });

        render(<WorldV2Page />);

        expect(mockMapMantra).toHaveBeenCalledWith(
            expect.objectContaining({ locale: defaultLocale }),
        );
    });

    test("panel ouvert : le focus est placé sur le bouton de fermeture", () => {
        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: true, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel: jest.fn(),
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);

        const closeBtn = screen.getByRole("button", {
            name: "worldPanelCloseAria",
        });

        expect(closeBtn).toHaveFocus();
    });

    test("panel fermé : Escape n'appelle pas closePanel()", () => {
        const closePanel = jest.fn();

        mockUseWorldHub.mockReturnValue({
            state: { isPanelOpen: false, drawerStack: ["root"] },
            openPanel: jest.fn(),
            closePanel,
            goBack: jest.fn(),
        });

        render(<WorldV2Page />);
        fireEvent.keyDown(document, { key: "Escape" });

        expect(closePanel).not.toHaveBeenCalled();
    });
});
