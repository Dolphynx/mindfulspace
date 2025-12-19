/**
 * @file selectors.ts
 * @description
 * Selectors for derived state from the World Hub reducer.
 *
 * Selectors centralize common derived computations and keep UI and provider code minimal.
 */

import type { DrawerView, WorldState } from "./types";

/**
 * Returns the current (top-most) drawer view.
 *
 * @param state - World Hub state.
 * @returns The current drawer view.
 */
export function selectCurrentView(state: WorldState): DrawerView {
    return state.drawerStack[state.drawerStack.length - 1];
}

/**
 * Returns whether navigating back is possible (stack has more than one item).
 *
 * @param state - World Hub state.
 * @returns True if the drawer stack has more than one item.
 */
export function selectCanGoBack(state: WorldState): boolean {
    return state.drawerStack.length > 1;
}
