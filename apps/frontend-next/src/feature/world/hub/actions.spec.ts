import { createWorldHubActions } from "./actions";
import type { Domain } from "./types";

/**
 * Tests unitaires de createWorldHubActions().
 *
 * @remarks
 * Objectif : valider que chaque action encapsule correctement le dispatch
 * attendu par le reducer du World Hub (type + payload).
 *
 * On ne teste pas le reducer ici : uniquement le contrat "action -> dispatch".
 */
describe("createWorldHubActions (World Hub)", () => {
    const D_SLEEP: Domain = "sleep";
    const D_MEDITATION: Domain = "meditation";
    const D_EXERCISE: Domain = "exercise";

    /**
     * Helper : extrait le dernier appel au dispatch sous forme d'objet.
     */
    function lastDispatchArg(dispatch: jest.Mock): unknown {
        const calls = dispatch.mock.calls;
        return calls[calls.length - 1]?.[0];
    }

    test("openOverviewAction() dispatch OPEN_OVERVIEW", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openOverviewAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "OPEN_OVERVIEW" });
    });

    test("openBadgesAction() dispatch OPEN_BADGES", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openBadgesAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "OPEN_BADGES" });
    });

    test("openDomainDetailAction(domain) dispatch OPEN_DOMAIN_DETAIL + domain", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openDomainDetailAction(D_EXERCISE);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({
            type: "OPEN_DOMAIN_DETAIL",
            domain: D_EXERCISE,
        });
    });

    test("openQuickLogAction() dispatch OPEN_QUICKLOG (domain undefined)", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openQuickLogAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        // Le code dispatch toujours `{ type, domain }`, même si undefined.
        expect(lastDispatchArg(dispatch)).toEqual({
            type: "OPEN_QUICKLOG",
            domain: undefined,
        });
    });

    test("openQuickLogAction(domain) dispatch OPEN_QUICKLOG + domain", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openQuickLogAction(D_SLEEP);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({
            type: "OPEN_QUICKLOG",
            domain: D_SLEEP,
        });
    });

    test("openStartSessionAction() dispatch OPEN_STARTSESSION (domain undefined)", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openStartSessionAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({
            type: "OPEN_STARTSESSION",
            domain: undefined,
        });
    });

    test("openStartSessionAction(domain) dispatch OPEN_STARTSESSION + domain (hors sleep)", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openStartSessionAction(D_MEDITATION);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({
            type: "OPEN_STARTSESSION",
            domain: D_MEDITATION,
        });
    });

    test("openProgramsAction() dispatch OPEN_PROGRAMS", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openProgramsAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "OPEN_PROGRAMS" });
    });

    test("goBackAction() dispatch GO_BACK", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.goBackAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "GO_BACK" });
    });

    test("closePanelAction() dispatch CLOSE_PANEL", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.closePanelAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "CLOSE_PANEL" });
    });

    test("openPanelAction() dispatch OPEN_PANEL", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        actions.openPanelAction();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(lastDispatchArg(dispatch)).toEqual({ type: "OPEN_PANEL" });
    });

    /**
     * Test "sanity" optionnel :
     * vérifie que l’objet retourné contient toutes les fonctions attendues.
     *
     * @remarks
     * Utile pour détecter un oubli lors d’un refactor.
     */
    test("createWorldHubActions() retourne un set complet d’actions", () => {
        const dispatch = jest.fn();
        const actions = createWorldHubActions(dispatch);

        expect(actions).toEqual(
            expect.objectContaining({
                openOverviewAction: expect.any(Function),
                openBadgesAction: expect.any(Function),
                openDomainDetailAction: expect.any(Function),
                openQuickLogAction: expect.any(Function),
                openStartSessionAction: expect.any(Function),
                openProgramsAction: expect.any(Function),
                goBackAction: expect.any(Function),
                closePanelAction: expect.any(Function),
                openPanelAction: expect.any(Function),
            }),
        );
    });
});
