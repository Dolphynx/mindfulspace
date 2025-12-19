"use client";

import type { ReactNode } from "react";
import { WorldHubProvider } from "../hub/WorldHubProvider";

/**
 * Point d'entrée client de la SPA "My World".
 *
 * @remarks
 * Ce composant encapsule :
 * - un état global "world hub" (drawer ouvert/fermé + route interne du panneau),
 * - un overlay/drawer par-dessus la map (`PanelOverlay`),
 * - et n'altère pas le rendu de la map (passée via `children`).
 *
 * **Principe d'architecture :**
 * - La page map (background) reste stable.
 * - Le drawer est un "layer" au-dessus (SPA).
 * - Toute navigation interne du drawer passe par le provider
 *   et non par le routeur Next.
 */
export default function WorldHubClient({ children }: { children: ReactNode }) {
    return (
        <WorldHubProvider>
            {children}
        </WorldHubProvider>
    );
}
