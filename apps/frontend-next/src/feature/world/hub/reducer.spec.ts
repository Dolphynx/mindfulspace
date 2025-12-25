import { createInitialWorldState, worldReducer } from "./reducer";
import type { Domain, WorldAction, WorldState } from "./types";

/**
 * Tests unitaires du reducer World Hub.
 *
 * @remarks
 * Ces tests valident les invariants et transitions critiques :
 * - état initial canonique,
 * - ouverture / fermeture du panneau,
 * - reconstruction correcte de la pile drawerStack selon les actions,
 * - gestion des domaines optionnels (quickLog / startSession / programs),
 * - sécurité du GO_BACK (ne descend jamais sous 1 entrée).
 *
 * Les tests sont orientés "boîte noire" : state + action -> nouvel état.
 */
describe("worldReducer (World Hub)", () => {
    const D_SLEEP: Domain = "sleep";
    const D_MEDITATION: Domain = "meditation";
    const D_EXERCISE: Domain = "exercise";

    test("createInitialWorldState() : panel fermé + pile contenant uniquement overview", () => {
        const s = createInitialWorldState();

        expect(s.isPanelOpen).toBe(false);
        expect(s.drawerStack).toEqual([{ type: "overview" }]);
        expect(s.drawerStack).toHaveLength(1);
    });

    test("OPEN_PANEL : ouvre le panneau sans modifier la pile", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_PANEL" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([{ type: "overview" }]);
    });

    test("CLOSE_PANEL : ferme le panneau et réinitialise la pile à overview", () => {
        const s0: WorldState = {
            isPanelOpen: true,
            drawerStack: [{ type: "overview" }, { type: "badges" }],
        };
        const a: WorldAction = { type: "CLOSE_PANEL" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(false);
        expect(s1.drawerStack).toEqual([{ type: "overview" }]);
    });

    test("OPEN_OVERVIEW : ouvre le panneau et force overview comme unique vue", () => {
        const s0: WorldState = {
            isPanelOpen: false,
            drawerStack: [{ type: "overview" }, { type: "badges" }],
        };
        const a: WorldAction = { type: "OPEN_OVERVIEW" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([{ type: "overview" }]);
    });

    test("OPEN_BADGES : ouvre le panneau et reconstruit la pile overview -> badges", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_BADGES" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([{ type: "overview" }, { type: "badges" }]);
    });

    test("OPEN_DOMAIN_DETAIL : ouvre le panneau et fixe domainDetail avec le domaine fourni", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_DOMAIN_DETAIL", domain: D_EXERCISE };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "domainDetail", domain: D_EXERCISE },
        ]);
    });

    test("OPEN_QUICKLOG : sans domaine, n’ajoute pas domain sur l’entrée quickLog", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_QUICKLOG" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([{ type: "overview" }, { type: "quickLog" }]);

        // Vérification explicite : pas de propriété domain
        expect("domain" in s1.drawerStack[1]).toBe(false);
    });

    test("OPEN_QUICKLOG : avec domaine, stocke domain sur l’entrée quickLog", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_QUICKLOG", domain: D_SLEEP };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "quickLog", domain: D_SLEEP },
        ]);
    });

    test("OPEN_STARTSESSION : sans domaine, n’ajoute pas domain sur l’entrée startSession", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_STARTSESSION" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "startSession" },
        ]);

        expect("domain" in s1.drawerStack[1]).toBe(false);
    });

    test("OPEN_STARTSESSION : avec domaine (hors sleep), stocke domain", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_STARTSESSION", domain: D_MEDITATION };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "startSession", domain: D_MEDITATION },
        ]);
    });

    test('OPEN_PROGRAMS : sans domaine, force domain="exercise"', () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_PROGRAMS" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "programs", domain: "exercise" },
        ]);
    });

    test('OPEN_PROGRAMS : avec domaine ("exercise" uniquement), utilise le domaine fourni', () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "OPEN_PROGRAMS", domain: "exercise" };

        const s1 = worldReducer(s0, a);

        expect(s1.isPanelOpen).toBe(true);
        expect(s1.drawerStack).toEqual([
            { type: "overview" },
            { type: "programs", domain: "exercise" },
        ]);
    });

    test("GO_BACK : si pile > 1, dépile la dernière vue", () => {
        const s0: WorldState = {
            isPanelOpen: true,
            drawerStack: [{ type: "overview" }, { type: "badges" }],
        };
        const a: WorldAction = { type: "GO_BACK" };

        const s1 = worldReducer(s0, a);

        expect(s1.drawerStack).toEqual([{ type: "overview" }]);
        expect(s1.isPanelOpen).toBe(true); // GO_BACK ne modifie pas l’ouverture
    });

    test("GO_BACK : si pile <= 1, retourne exactement le même state (référence inchangée)", () => {
        const s0 = createInitialWorldState();
        const a: WorldAction = { type: "GO_BACK" };

        const s1 = worldReducer(s0, a);

        // Important : ton reducer fait `return state;` dans ce cas
        expect(s1).toBe(s0);
    });
});
