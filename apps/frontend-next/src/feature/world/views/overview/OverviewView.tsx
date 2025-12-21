"use client";

/**
 * @file OverviewView.tsx
 * @description
 * Vue principale du dashboard du World Hub (SPA world-v2).
 *
 * Responsabilités :
 * - Initialiser le chargement des métriques globales via {@link useWorldOverview}.
 * - Dériver les états `isLoading` et `hasData`.
 * - Composer les sections de l’overview.
 *
 * Contrainte Next.js (App Router) :
 * - Éviter de passer des fonctions (ex: `t`, handlers) en props à des Client Components
 *   pouvant être importés/rendus côté serveur (TS71007).
 *
 * Stratégie :
 * - Chaque section gère sa traduction et ses actions via ses propres hooks client.
 */

import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { TopSummarySection } from "@/feature/world/views/overview/sections/TopSummarySection";
import { TodaySection } from "@/feature/world/views/overview/sections/TodaySection";
import { DomainsSection } from "@/feature/world/views/overview/sections/DomainsSection";

/**
 * Vue dashboard principale du World Hub.
 *
 * @returns Composant React client représentant l’overview du World Hub.
 */
export function OverviewView() {
    const overview = useWorldOverview();

    const isLoading = overview.status === "idle" || overview.status === "loading";
    const hasData = overview.status === "success";

    return (
        <div className="space-y-6">
            <TopSummarySection
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
            />
            <TodaySection />
            <DomainsSection
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
            />
        </div>
    );
}
