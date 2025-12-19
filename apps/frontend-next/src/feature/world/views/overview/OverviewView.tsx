"use client";

/**
 * @file OverviewView.tsx
 * @description
 * Main dashboard view of the World Hub (SPA world-v2).
 *
 * UI goals:
 * - Cross-domain snapshot based on real metrics.
 * - "Today" block.
 * - Recent badges (always visible, independent from metrics).
 * - Three domain cards driven by real metrics.
 */

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "../../hub/WorldHubProvider";
import type { Domain } from "../../hub/types";

import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { TopSummarySection } from "@/feature/world/views/overview/sections/TopSummarySection";
import { TodaySection } from "@/feature/world/views/overview/sections/TodaySection";
import { DomainsSection } from "@/feature/world/views/overview/sections/DomainsSection";

/**
 * Main dashboard view of the World Hub.
 *
 * @returns A client React component.
 */
export function OverviewView() {
    const t = useTranslations("world");
    const { openBadges, openQuickLog, openStartSession, openPrograms, openDomainDetail } =
        useWorldHub();

    const overview = useWorldOverview();
    const isLoading = overview.status === "idle" || overview.status === "loading";
    const hasData = overview.status === "success";

    /**
     * Opens the domain detail view.
     *
     * @param domain - Domain identifier (sleep, meditation, exercise).
     */
    function handleOpenDomainDetail(domain: Domain) {
        openDomainDetail(domain);
    }

    return (
        <div className="space-y-6">
            <TopSummarySection
                t={t}
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
                onOpenBadges={() => openBadges()}
            />

            <TodaySection
                t={t}
                onOpenQuickLog={() => openQuickLog()}
                onOpenStartSession={() => openStartSession()}
                onOpenPrograms={() => openPrograms()}
            />

            <DomainsSection
                t={t}
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
                onOpenDomainDetail={handleOpenDomainDetail}
                onOpenQuickLog={(domain?: Domain) => openQuickLog(domain)}
            />
        </div>
    );
}
