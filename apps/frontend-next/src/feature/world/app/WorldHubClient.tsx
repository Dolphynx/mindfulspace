"use client";

import type { ReactNode } from "react";
import { WorldHubProvider } from "../hub/WorldHubProvider";

/**
 * Point d’entrée **client-side** du périmètre “My World”.
 *
 * Ce composant établit le contexte React nécessaire au fonctionnement du
 * “World Hub” (navigation interne au panneau / overlay) au-dessus d’un contenu
 * de fond (typiquement la map) fourni via `children`.
 *
 * ## Responsabilités
 * - Déclarer l’exécution côté client via la directive Next `"use client"`.
 * - Fournir le contexte global `WorldHubProvider` à l’ensemble du sous-arbre.
 * - Préserver l’indépendance du contenu de fond (`children`) vis-à-vis de l’état
 *   du hub (l’overlay se gère en surcouche via le provider et ses consommateurs).
 *
 * ## Notes d’architecture
 * - La navigation interne du hub est pilotée par un état applicatif (provider),
 *   et non par le routeur Next.js.
 * - Les composants consommateurs (ex. overlay/drawer) sont attendus plus bas
 *   dans l’arbre et s’abonnent au contexte du hub.
 *
 * @param props - Propriétés du composant.
 * @param props.children - Contenu de fond (“background”) à rendre sous la surcouche.
 * @returns Arbre React enveloppé par le provider du hub.
 */
export default function WorldHubClient({ children }: { children: ReactNode }) {
    return <WorldHubProvider>{children}</WorldHubProvider>;
}
