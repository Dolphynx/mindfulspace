/**
 * @file types.ts
 * @description
 * Définition des types constituant la machine d’état du World Hub (world-v2).
 *
 * Ce module formalise :
 * - les domaines fonctionnels supportés,
 * - les vues possibles du drawer,
 * - la structure de l’état global,
 * - l’ensemble des actions reconnues par le reducer.
 */

/**
 * Domaines fonctionnels disponibles dans le World Hub.
 *
 * Ces valeurs sont utilisées de manière transversale :
 * - navigation interne du drawer,
 * - ciblage des vues métier,
 * - contraintes de typage dans les actions.
 */
export type Domain = "sleep" | "meditation" | "exercise";

/**
 * Vue élémentaire du drawer.
 *
 * Chaque entrée de la pile `drawerStack` correspond à une vue,
 * éventuellement paramétrée par un domaine.
 *
 * Contraintes de typage :
 * - `startSession` exclut explicitement le domaine `sleep`,
 * - `programs` est actuellement limité au domaine `"exercise"`,
 *   ce qui permet d’anticiper une extension future sans casser l’API.
 */
export type DrawerView =
    | { type: "overview" }
    | { type: "badges" }
    | { type: "quickLog"; domain?: Domain }
    | { type: "startSession"; domain?: Exclude<Domain, "sleep"> }
    | { type: "programs"; domain?: "exercise" }
    | { type: "domainDetail"; domain: Domain };

/**
 * État global du World Hub.
 *
 * Structure :
 * - `isPanelOpen` pilote l’ouverture/fermeture du drawer.
 * - `drawerStack` représente l’historique de navigation interne.
 *
 * Invariant :
 * - `drawerStack` contient toujours au moins une entrée
 *   correspondant à la vue `overview`.
 */
export type WorldState = {
    isPanelOpen: boolean;
    drawerStack: DrawerView[];
};

/**
 * Ensemble des actions reconnues par le reducer du World Hub.
 *
 * Chaque action représente une intention métier claire
 * (navigation, ouverture/fermeture du panneau, retour arrière).
 *
 * Le typage en union discriminée garantit :
 * - l’exhaustivité du `switch` dans le reducer,
 * - la cohérence entre actions et vues manipulées.
 */
export type WorldAction =
    | { type: "OPEN_PANEL" }
    | { type: "CLOSE_PANEL" }
    | { type: "OPEN_OVERVIEW" }
    | { type: "OPEN_BADGES" }
    | { type: "OPEN_DOMAIN_DETAIL"; domain: Domain }
    | { type: "OPEN_QUICKLOG"; domain?: Domain }
    | { type: "OPEN_STARTSESSION"; domain?: Exclude<Domain, "sleep"> }
    | { type: "OPEN_PROGRAMS"; domain?: "exercise" }
    | { type: "GO_BACK" };
