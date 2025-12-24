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

/**
 * Mock du hook `useParams` de Next.js afin de contrôler la locale courante.
 */
jest.mock("next/navigation", () => ({
    useParams: jest.fn(),
}));

/**
 * Mock du contexte de traduction.
 *
 * @remarks
 * Le hook retourne directement la clé afin de simplifier les assertions
 * (pas de dépendance aux fichiers de traduction).
 */
jest.mock("@/i18n/TranslationContext", () => ({
    useTranslations: () => (key: string) => key,
}));

// -----------------------------------------------------------------------------
// Mock du hook WorldHub
// -----------------------------------------------------------------------------

/**
 * État minimal du WorldHub utilisé par la page World V2.
 */
type WorldHubStateMock = {
    /** Indique si le panneau fullscreen est ouvert */
    isPanelOpen: boolean;

    /** Pile de navigation interne du drawer */
    drawerStack: unknown[];
};

/**
 * API minimale du WorldHub exposée à la page.
 */
type WorldHubApiMock = {
    state: WorldHubStateMock;
    openPanel: jest.Mock;
    closePanel: jest.Mock;
    goBack: jest.Mock;
};

/**
 * Mock du hook `useWorldHub`.
 *
 * @remarks
 * Le mock est configuré dynamiquement dans chaque test afin de simuler
 * différents états de navigation.
 */
const mockUseWorldHub = jest.fn<WorldHubApiMock, []>();

jest.mock("@/feature/world/hub/WorldHubProvider", () => ({
    __esModule: true,
    useWorldHub: () => mockUseWorldHub(),
}));

// -----------------------------------------------------------------------------
// Mocks des composants lourds (map, hub, overlays)
// -----------------------------------------------------------------------------

/**
 * Mock du composant WorldHubClient.
 *
 * @remarks
 * Le composant se contente de rendre ses enfants afin de préserver
 * la hiérarchie réelle sans activer la logique interne du hub.
 */
jest.mock("@/feature/world/app/WorldHubClient", () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="world-hub-client">{children}</div>
    ),
}));

/**
 * Mock du corps du panneau fullscreen.
 */
jest.mock("@/feature/world/panel/PanelBody", () => ({
    PanelBody: () => <div data-testid="panel-body" />,
}));

/**
 * Mock de l’overlay de badges récents.
 */
jest.mock("@/components/badges/WorldBadgesLotusOverlay", () => ({
    WorldBadgesLotusOverlay: () => <div data-testid="badges-overlay" />,
}));

/**
 * Mock des couches de la carte (SVG).
 */
jest.mock("@/components/map/IslandMapLayers", () => ({
    IslandMapLayers: () => <div data-testid="map-layers" />,
}));

/**
 * Mock du composant MapMantra.
 *
 * @remarks
 * Le mock est une fonction `jest.fn` afin de pouvoir vérifier
 * la valeur de la prop `locale` passée par la page.
 */
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
    /**
     * Configuration par défaut avant chaque test.
     *
     * @remarks
     * - locale valide (`fr`)
     * - panneau fermé
     * - pile de navigation minimale
     */
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

    /**
     * Vérifie que la page se rend sans erreur.
     */
    test("la page se rend sans crash", () => {
        render(<WorldV2Page />);
        expect(screen.getByTestId("world-hub-client")).toBeInTheDocument();
    });

    /**
     * Vérifie que les éléments visuels principaux sont montés.
     */
    test("les overlays visuels sont montés (map + mantra + badges)", () => {
        render(<WorldV2Page />);
        expect(screen.getByTestId("map-layers")).toBeInTheDocument();
        expect(screen.getByTestId("map-mantra")).toBeInTheDocument();
        expect(screen.getByTestId("badges-overlay")).toBeInTheDocument();
    });

    /**
     * Vérifie que le panneau fullscreen n’est pas rendu lorsque fermé.
     */
    test("le panneau principal n'est PAS affiché quand isPanelOpen=false", () => {
        render(<WorldV2Page />);
        expect(screen.queryByTestId("panel-body")).not.toBeInTheDocument();
    });

    /**
     * Vérifie que le panneau fullscreen est rendu lorsque ouvert.
     */
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

    /**
     * Vérifie que la page ne plante pas si la locale est invalide.
     */
    test("fallback sur la locale par défaut si locale invalide (ne crash pas)", () => {
        (useParams as jest.Mock).mockReturnValue({ locale: "xx" });

        render(<WorldV2Page />);
        expect(screen.getByTestId("world-hub-client")).toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Tests d’interaction SPA
    // -------------------------------------------------------------------------

    /**
     * Vérifie que le CTA d’entrée ouvre le panneau.
     */
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
        await user.click(screen.getByRole("button", { name: "worldStartCta" }));

        expect(openPanel).toHaveBeenCalledTimes(1);
    });

    /**
     * Vérifie que le clic sur le backdrop ferme le panneau.
     */
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
            screen.getByRole("button", { name: "worldPanelCloseAria" })
        );

        expect(closePanel).toHaveBeenCalledTimes(1);
    });

    /**
     * Vérifie que la touche Escape ferme le panneau.
     */
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

    /**
     * Vérifie que le bouton retour apparaît uniquement lorsque la navigation le permet.
     */
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
            screen.getByRole("button", { name: "worldPanelBackAria" })
        );

        expect(goBack).toHaveBeenCalledTimes(1);
    });

    /**
     * Vérifie que la locale transmise à MapMantra est correcte
     * (locale valide ou fallback).
     */
    test("MapMantra reçoit la locale : fr (valide) / defaultLocale (fallback)", () => {
        (useParams as jest.Mock).mockReturnValue({ locale: "fr" });
        render(<WorldV2Page />);

        expect(mockMapMantra).toHaveBeenCalledWith(
            expect.objectContaining({ locale: "fr" })
        );

        jest.clearAllMocks();
        (useParams as jest.Mock).mockReturnValue({ locale: "xx" });

        render(<WorldV2Page />);

        expect(mockMapMantra).toHaveBeenCalledWith(
            expect.objectContaining({ locale: defaultLocale })
        );
    });

    /**
     * Vérifie que le focus clavier est automatiquement placé
     * sur le bouton de fermeture lorsque le panneau fullscreen est ouvert.
     *
     * @remarks
     * Ce comportement est essentiel pour l’accessibilité :
     * - le focus doit être positionné dans le dialog dès son ouverture,
     * - l’utilisateur clavier ou lecteur d’écran peut interagir immédiatement,
     * - cela garantit la conformité avec les bonnes pratiques ARIA pour les modals.
     */
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

    /**
     * Vérifie que la touche Escape n’a aucun effet lorsque
     * le panneau fullscreen est fermé.
     *
     * @remarks
     * Ce test prévient les régressions où une action clavier
     * pourrait déclencher une fermeture ou un effet de bord
     * alors qu’aucun panneau n’est actif.
     */
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
