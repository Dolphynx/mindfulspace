"use client";

/**
 * @file WorldHubProvider.tsx
 * @description
 * Provider de contexte pour la SPA “World Hub” (world-v2).
 *
 * Responsabilités :
 * - Porter l’état global du hub via un reducer (ouverture du panneau + pile de vues).
 * - Exposer une API stable d’actions de navigation interne au panneau.
 * - Publier un signal de rafraîchissement global (`refreshKey`) pour permettre aux
 *   consommateurs de relancer leurs chargements de données.
 *
 * Modèle :
 * - Le fond (page “world”) reste stable.
 * - Le panneau (drawer/overlay) est une surcouche pilotée par l’état `isPanelOpen`.
 * - La navigation interne du panneau est modélisée par une pile `drawerStack`.
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
    useState,
} from "react";

import { createInitialWorldState, worldReducer } from "./reducer";
import type { Domain, DrawerView, WorldState } from "./types";
import { createWorldHubActions } from "./actions";
import { selectCanGoBack, selectCurrentView } from "./selectors";

/**
 * API exposée par le World Hub via React Context.
 *
 * Contenu :
 * - État brut du reducer et informations dérivées (vue courante, possibilité de retour).
 * - Mécanisme de rafraîchissement global (clé incrémentale).
 * - Actions de navigation et de contrôle du panneau.
 */
export type WorldHubApi = {
    /** État brut du World Hub (reducer). */
    state: WorldState;

    /** Vue courante affichée dans le drawer (sommet de pile). */
    currentView: DrawerView;

    /** Indique si un retour arrière est possible dans la pile de vues. */
    canGoBack: boolean;

    /**
     * Clé de rafraîchissement globale.
     *
     * Les consommateurs peuvent l’utiliser comme dépendance de `useEffect`
     * afin de relancer un chargement lorsque l’application le demande.
     */
    refreshKey: number;

    /**
     * Incrémente `refreshKey` afin de signaler aux consommateurs qu’un rafraîchissement
     * doit avoir lieu (re-fetch).
     */
    bumpRefreshKey: () => void;

    /** Ouvre la vue d’overview dans le panneau. */
    openOverview: () => void;

    /** Ouvre la vue des badges dans le panneau. */
    openBadges: () => void;

    /**
     * Ouvre l’écran de domaine (alias).
     *
     * Cet alias existe pour maintenir la compatibilité avec des chemins de code
     * plus anciens qui appelaient `openDomain(domain)`. Dans world-v2, la navigation
     * par domaine passe par la vue `domainDetail`.
     *
     * @param domain - Domaine à afficher.
     */
    openDomain: (domain: Domain) => void;

    /**
     * Ouvre la vue de détail d’un domaine.
     *
     * @param domain - Domaine à afficher.
     */
    openDomainDetail: (domain: Domain) => void;

    /**
     * Ouvre la vue de saisie rapide (quick log).
     *
     * @param domain - Domaine ciblé (optionnel).
     */
    openQuickLog: (domain?: Domain) => void;

    /**
     * Ouvre la vue “start session”.
     *
     * Le domaine `sleep` est exclu par typage.
     *
     * @param domain - Domaine ciblé (optionnel, hors `sleep`).
     */
    openStartSession: (domain?: Exclude<Domain, "sleep">) => void;

    /** Ouvre la vue des programmes. */
    openPrograms: () => void;

    /** Revient à l’entrée précédente dans la pile de vues. */
    goBack: () => void;

    /** Ferme le panneau et réinitialise l’état de navigation interne. */
    closePanel: () => void;

    /** Ouvre le panneau sans altérer la pile de vues. */
    openPanel: () => void;
};

/**
 * Contexte React du World Hub.
 *
 * Le contexte est initialisé à `null` afin de pouvoir détecter l’absence
 * de provider et lever une erreur explicite dans `useWorldHub`.
 */
const WorldHubContext = createContext<WorldHubApi | null>(null);

/**
 * Provider du World Hub.
 *
 * Compose :
 * - un reducer (`worldReducer`) avec état initial via `createInitialWorldState`,
 * - des actions de navigation encapsulant le `dispatch`,
 * - des sélecteurs dérivés pour la vue courante et la capacité de retour,
 * - un mécanisme de rafraîchissement global (`refreshKey`).
 *
 * @param props - Propriétés du provider.
 * @param props.children - Sous-arbre React consommateur du contexte.
 * @returns Provider React exposant {@link WorldHubApi}.
 */
export function WorldHubProvider(props: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(worldReducer, undefined, createInitialWorldState);

    const [refreshKey, setRefreshKey] = useState(0);

    /**
     * Incrémente la clé de rafraîchissement.
     *
     * Cette clé est conçue pour être consommée en dépendance de hooks de chargement
     * afin de déclencher un re-fetch global après des mutations.
     */
    const bumpRefreshKey = useCallback(() => {
        setRefreshKey((v) => v + 1);
    }, []);

    /**
     * Actions encapsulant le dispatch du reducer.
     *
     * Mémoïsées afin de fournir des références stables.
     */
    const actions = useMemo(() => createWorldHubActions(dispatch), [dispatch]);

    /**
     * Vue courante (sommet de pile) dérivée de l’état.
     */
    const currentView = useMemo(() => selectCurrentView(state), [state]);

    /**
     * Indique si un retour arrière est possible (pile > 1).
     */
    const canGoBack = useMemo(() => selectCanGoBack(state), [state]);

    /**
     * Valeur fournie au contexte.
     *
     * L’objet est mémoïsé pour :
     * - stabiliser les références des fonctions exposées,
     * - limiter les re-renders des consommateurs à des changements utiles.
     */
    const value = useMemo<WorldHubApi>(
        () => ({
            state,
            currentView,
            canGoBack,
            refreshKey,
            bumpRefreshKey,

            openOverview: actions.openOverviewAction,
            openBadges: actions.openBadgesAction,

            openDomain: actions.openDomainDetailAction,
            openDomainDetail: actions.openDomainDetailAction,

            openQuickLog: actions.openQuickLogAction,
            openStartSession: actions.openStartSessionAction,
            openPrograms: actions.openProgramsAction,

            goBack: actions.goBackAction,

            closePanel: actions.closePanelAction,
            openPanel: actions.openPanelAction,
        }),
        [state, currentView, canGoBack, refreshKey, bumpRefreshKey, actions],
    );

    return <WorldHubContext.Provider value={value}>{props.children}</WorldHubContext.Provider>;
}

/**
 * Hook d’accès au World Hub (obligatoire).
 *
 * Ce hook impose la présence du provider en levant une erreur explicite
 * lorsqu’il est utilisé hors du sous-arbre de {@link WorldHubProvider}.
 *
 * @throws {Error} Si utilisé en dehors de {@link WorldHubProvider}.
 * @returns API du World Hub.
 */
export function useWorldHub(): WorldHubApi {
    const v = useContext(WorldHubContext);
    if (!v) throw new Error("useWorldHub must be used within WorldHubProvider");
    return v;
}

/**
 * Hook d’accès optionnel au World Hub.
 *
 * Ce hook permet d’écrire des composants réutilisables pouvant fonctionner :
 * - avec le provider (retourne l’API),
 * - sans le provider (retourne `null`).
 *
 * @returns API du World Hub si disponible, sinon `null`.
 */
export function useWorldHubOptional(): WorldHubApi | null {
    return useContext(WorldHubContext);
}
