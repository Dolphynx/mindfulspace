import { selectCurrentView, selectCanGoBack } from "./selectors";
import type { WorldState } from "./types";

/**
 * Tests unitaires des selectors du World Hub.
 *
 * @remarks
 * Les selectors sont des fonctions pures :
 * - ils ne modifient jamais l’état,
 * - ils dérivent des informations simples mais structurantes.
 *
 * Ces tests garantissent que la navigation interne du drawer
 * repose sur des règles stables et explicites.
 */
describe("World Hub selectors", () => {
    test("selectCurrentView() retourne la dernière vue de la pile", () => {
        const state: WorldState = {
            isPanelOpen: true,
            drawerStack: [
                { type: "overview" },
                { type: "badges" },
                { type: "domainDetail", domain: "exercise" },
            ],
        };

        const view = selectCurrentView(state);

        expect(view).toEqual({ type: "domainDetail", domain: "exercise" });
    });

    test("selectCurrentView() fonctionne avec une pile minimale (overview seule)", () => {
        const state: WorldState = {
            isPanelOpen: false,
            drawerStack: [{ type: "overview" }],
        };

        const view = selectCurrentView(state);

        expect(view).toEqual({ type: "overview" });
    });

    test("selectCanGoBack() retourne false si la pile contient une seule vue", () => {
        const state: WorldState = {
            isPanelOpen: true,
            drawerStack: [{ type: "overview" }],
        };

        const canGoBack = selectCanGoBack(state);

        expect(canGoBack).toBe(false);
    });

    test("selectCanGoBack() retourne true si la pile contient plus d’une vue", () => {
        const state: WorldState = {
            isPanelOpen: true,
            drawerStack: [{ type: "overview" }, { type: "badges" }],
        };

        const canGoBack = selectCanGoBack(state);

        expect(canGoBack).toBe(true);
    });
});
