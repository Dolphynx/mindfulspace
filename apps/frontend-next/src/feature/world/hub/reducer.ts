import type { WorldAction, WorldState } from "./types";

/**
 * Construit l’état initial du World Hub.
 *
 * Invariants :
 * - Le panneau est fermé au démarrage.
 * - La pile de navigation interne contient toujours au moins la vue `overview`.
 *
 * @returns État initial conforme au type {@link WorldState}.
 */
export function createInitialWorldState(): WorldState {
    return {
        isPanelOpen: false,
        drawerStack: [{ type: "overview" }],
    };
}

/**
 * Reducer du World Hub (navigation interne du drawer + état ouvert/fermé).
 *
 * Modèle :
 * - `isPanelOpen` pilote l’affichage du panneau (overlay/drawer).
 * - `drawerStack` représente l’historique de navigation interne au panneau.
 *
 * Conventions :
 * - Les actions d’ouverture positionnent généralement `isPanelOpen: true`.
 * - Plusieurs actions réinitialisent la pile à partir de `overview` afin de
 *   garantir un point d’entrée cohérent.
 *
 * @param state - État courant du World Hub.
 * @param action - Action typée décrivant la transition demandée.
 * @returns Nouvel état calculé à partir de `state` et `action`.
 */
export function worldReducer(state: WorldState, action: WorldAction): WorldState {
    switch (action.type) {
        /**
         * Ouvre le panneau sans modifier la pile de navigation interne.
         */
        case "OPEN_PANEL":
            return { ...state, isPanelOpen: true };

        /**
         * Ferme le panneau et réinitialise la pile à l’overview.
         *
         * L’overview reste l’unique entrée de pile afin de conserver
         * un état canonique lors de la prochaine ouverture.
         */
        case "CLOSE_PANEL":
            return {
                ...state,
                isPanelOpen: false,
                drawerStack: [{ type: "overview" }],
            };

        /**
         * Ouvre le panneau et force l’overview comme unique vue active.
         */
        case "OPEN_OVERVIEW":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [{ type: "overview" }],
            };

        /**
         * Ouvre le panneau sur la vue “badges”, en gardant `overview` comme racine.
         */
        case "OPEN_BADGES":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [{ type: "overview" }, { type: "badges" }],
            };

        /**
         * Ouvre le panneau sur la vue de détail d’un domaine.
         *
         * @remarks
         * La pile est reconstruite explicitement afin d’éviter d’empiler des états
         * incohérents et pour garantir un point de retour clair vers `overview`.
         */
        case "OPEN_DOMAIN_DETAIL":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    { type: "domainDetail", domain: action.domain },
                ],
            };

        /**
         * Ouvre le panneau sur la vue “quick log”.
         *
         * Le domaine est optionnel :
         * - si fourni, il est stocké dans l’entrée de pile,
         * - sinon l’entrée ne contient pas la propriété `domain`.
         */
        case "OPEN_QUICKLOG":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "quickLog",
                        ...(action.domain ? { domain: action.domain } : {}),
                    },
                ],
            };

        /**
         * Ouvre le panneau sur la vue “start session”.
         *
         * Le domaine est optionnel :
         * - si fourni, il est stocké dans l’entrée de pile,
         * - sinon l’entrée ne contient pas la propriété `domain`.
         */
        case "OPEN_STARTSESSION":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "startSession",
                        ...(action.domain ? { domain: action.domain } : {}),
                    },
                ],
            };

        /**
         * Ouvre le panneau sur la vue “programs”.
         *
         * Règle métier :
         * - si `action.domain` est fourni, il est utilisé,
         * - sinon un domaine par défaut est forcé à `"exercise"`.
         */
        case "OPEN_PROGRAMS":
            return {
                ...state,
                isPanelOpen: true,
                drawerStack: [
                    { type: "overview" },
                    {
                        type: "programs",
                        ...(action.domain
                            ? { domain: action.domain }
                            : { domain: "exercise" }),
                    },
                ],
            };

        /**
         * Revient à l’entrée précédente dans la pile de navigation interne.
         *
         * Invariant :
         * - La pile ne peut pas être réduite en dessous de 1 élément
         *   (l’overview reste toujours présente).
         */
        case "GO_BACK": {
            if (state.drawerStack.length <= 1) return state;
            return { ...state, drawerStack: state.drawerStack.slice(0, -1) };
        }

        /**
         * Retourne l’état inchangé si l’action n’est pas reconnue.
         *
         * Le typage de `WorldAction` est supposé limiter ces cas, mais ce `default`
         * garantit une stabilité si des actions externes ou des évolutions de type
         * apparaissent.
         */
        default:
            return state;
    }
}
