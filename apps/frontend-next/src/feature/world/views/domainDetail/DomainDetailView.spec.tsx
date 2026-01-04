import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

/**
 * Tests unitaires de DomainDetailView.
 *
 * @remarks
 * DomainDetailView est un conteneur :
 * - lit `refreshKey` depuis le WorldHub,
 * - résout un titre traduit selon le domaine,
 * - rend un sous-composant métier selon `domain`,
 * - force un remount du contenu via `key={refreshKey}`.
 *
 * On teste :
 * - le mapping domain -> composant rendu,
 * - les clés de traduction utilisées pour le titre / sous-titre,
 * - le remount lorsque refreshKey change (preuve via un compteur mount/unmount).
 */

// -----------------------------------------------------------------------------
// Helpers "probe" pour tester le remount via key={refreshKey}
// -----------------------------------------------------------------------------

let mountCount = 0;
let unmountCount = 0;

function RemountProbe() {
    React.useEffect(() => {
        mountCount += 1;
        return () => {
            unmountCount += 1;
        };
    }, []);
    return <div data-testid="remount-probe" />;
}

// -----------------------------------------------------------------------------
// Mocks i18n + WorldHub
// -----------------------------------------------------------------------------

const mockUseWorldHub = jest.fn(() => ({
    goBack: jest.fn(),
    refreshKey: 0,
}));

jest.mock("../../hub/WorldHubProvider", () => ({
    __esModule: true,
    useWorldHub: () => mockUseWorldHub(),
}));

/**
 * Mock de la traduction : retourne la clé demandée.
 * Permet d'asserter facilement les valeurs rendues.
 *
 * IMPORTANT :
 * - le mock doit accepter `ns` (sinon TS2554: expected 0 args, got 1)
 */
const mockUseTranslations = jest.fn((_ns: string) => (key: string) => key);

jest.mock("@/i18n/TranslationContext", () => ({
    __esModule: true,
    useTranslations: (ns: string) => mockUseTranslations(ns),
}));

/**
 * Mock de l’icône lucide (évite soucis de rendu / SVG).
 */
jest.mock("lucide-react", () => ({
    __esModule: true,
    ArrowLeft: () => <span data-testid="arrow-left-icon" />,
}));

// -----------------------------------------------------------------------------
// Mocks des sous-composants métier (domain details)
//
// @remarks
// On mock "sleep" avec un probe pour tester le remount via refreshKey.
// Les autres domaines restent des mocks simples.
// -----------------------------------------------------------------------------

jest.mock("./domains/SleepDomainDetail", () => ({
    __esModule: true,
    SleepDomainDetail: () => (
        <div data-testid="sleep-domain-detail">
            <RemountProbe />
        </div>
    ),
}));

jest.mock("./domains/MeditationDomainDetail", () => ({
    __esModule: true,
    MeditationDomainDetail: () => <div data-testid="meditation-domain-detail" />,
}));

jest.mock("./domains/ExerciseDomainDetail", () => ({
    __esModule: true,
    ExerciseDomainDetail: () => <div data-testid="exercise-domain-detail" />,
}));

// -----------------------------------------------------------------------------
// Module testé
// -----------------------------------------------------------------------------
import { DomainDetailView } from "./DomainDetailView";
import type { Domain } from "../../hub/types";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("DomainDetailView (World Hub)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mountCount = 0;
        unmountCount = 0;

        mockUseWorldHub.mockReturnValue({
            goBack: jest.fn(),
            refreshKey: 0,
        });
    });

    test("utilise les clés de traduction attendues (sous-titre, titre)", () => {
        render(<DomainDetailView domain={"meditation" as Domain} />);

        // Le sous-titre commun
        expect(screen.getByText("domainDetail.subtitle")).toBeInTheDocument();

        // Le titre dépend du domaine
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "domains.meditation",
        );

        // Vérifie que le namespace "world" est bien demandé
        expect(mockUseTranslations).toHaveBeenCalledWith("world");
    });

    test("rend SleepDomainDetail si domain=sleep", () => {
        render(<DomainDetailView domain={"sleep" as Domain} />);

        expect(screen.getByTestId("sleep-domain-detail")).toBeInTheDocument();
        expect(
            screen.queryByTestId("meditation-domain-detail"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId("exercise-domain-detail"),
        ).not.toBeInTheDocument();

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "domains.sleep",
        );
    });

    test("rend MeditationDomainDetail si domain=meditation", () => {
        render(<DomainDetailView domain={"meditation" as Domain} />);

        expect(
            screen.getByTestId("meditation-domain-detail"),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId("sleep-domain-detail"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId("exercise-domain-detail"),
        ).not.toBeInTheDocument();

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "domains.meditation",
        );
    });

    test("rend ExerciseDomainDetail si domain=exercise", () => {
        render(<DomainDetailView domain={"exercise" as Domain} />);

        expect(screen.getByTestId("exercise-domain-detail")).toBeInTheDocument();
        expect(
            screen.queryByTestId("sleep-domain-detail"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId("meditation-domain-detail"),
        ).not.toBeInTheDocument();

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "domains.exercise",
        );
    });

    test("refreshKey : force un remount du contenu interne (key change)", () => {
        // 1) render initial : refreshKey=0
        mockUseWorldHub.mockReturnValue({
            goBack: jest.fn(),
            refreshKey: 0,
        });

        const { rerender } = render(
            <DomainDetailView domain={"sleep" as Domain} />,
        );

        expect(screen.getByTestId("sleep-domain-detail")).toBeInTheDocument();
        expect(screen.getByTestId("remount-probe")).toBeInTheDocument();
        expect(mountCount).toBe(1);
        expect(unmountCount).toBe(0);

        // 2) rerender avec refreshKey=1 : devrait unmount + mount le subtree keyé
        mockUseWorldHub.mockReturnValue({
            goBack: jest.fn(),
            refreshKey: 1,
        });

        rerender(<DomainDetailView domain={"sleep" as Domain} />);

        expect(screen.getByTestId("sleep-domain-detail")).toBeInTheDocument();
        expect(screen.getByTestId("remount-probe")).toBeInTheDocument();

        expect(mountCount).toBe(2);
        expect(unmountCount).toBe(1);
    });
});
