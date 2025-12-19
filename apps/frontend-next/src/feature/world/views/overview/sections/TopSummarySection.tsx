// File: src/feature/world/views/overview/sections/TopSummarySection.tsx

"use client";

/**
 * @file TopSummarySection.tsx
 * @description
 * Overview top summary section. Renders the snapshot panel on the left and recent badges on the right.
 */

import { WorldBadgesStrip } from "@/feature/world/components/WorldBadgesStrip";
import { WorldSnapshotPanel } from "@/feature/world/components/WorldSnapshotPanel";
import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { CardShell } from "@/feature/world/views/shared/CardShell";
import { SkeletonPanel } from "@/feature/world/views/overview/components/OverviewSkeletons";
import { ErrorPanel } from "@/feature/world/views/overview/components/OverviewErrors";

type OverviewResult = ReturnType<typeof useWorldOverview>;

/**
 * Props for {@link TopSummarySection}.
 */
export type TopSummarySectionProps = {
    /**
     * Translation function for the "world" namespace.
     */
    t: (key: string) => string;

    /**
     * World overview hook result.
     */
    overview: OverviewResult;

    /**
     * Whether metrics are currently loading.
     */
    isLoading: boolean;

    /**
     * Whether metrics have been successfully loaded.
     */
    hasData: boolean;

    /**
     * Handler to open the badges panel.
     */
    onOpenBadges: () => void;
};

/**
 * Top summary section (snapshot + recent badges).
 *
 * @param props - Component props.
 * @returns A section component.
 */
export function TopSummarySection(props: TopSummarySectionProps) {
    const { t, overview, isLoading, hasData, onOpenBadges } = props;

    if (isLoading) {
        return (
            <CardShell
                title={t("overview.snapshotTitle")}
                subtitle={t("overview.topSummaryAria") ?? undefined}
                className="relative"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SkeletonPanel />
                    <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                        <div className="h-4 w-24 rounded bg-white/70" />
                        <div className="mt-3 h-10 rounded-2xl bg-white/60 border border-white/40" />
                    </div>
                </div>
            </CardShell>
        );
    }

    if (!hasData || overview.data == null) {
        return (
            <CardShell
                title={t("overview.snapshotTitle")}
                subtitle={t("overview.topSummaryAria") ?? undefined}
                className="relative"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ErrorPanel
                        title={t("overview.snapshotTitle")}
                        message={t("overview.metricsLoadError") ?? "Impossible de charger les métriques."}
                    />

                    <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-800">
                                {t("overview.recentBadgesTitle")}
                            </div>

                            <button
                                type="button"
                                onClick={onOpenBadges}
                                className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                            >
                                {t("overview.viewAll")}
                            </button>
                        </div>

                        <div className="mt-3">
                            <WorldBadgesStrip />
                        </div>
                    </div>
                </div>
            </CardShell>
        );
    }

    const data = overview.data;

    return (
        <CardShell
            title={t("overview.snapshotTitle")}
            subtitle={t("overview.topSummaryAria") ?? undefined}
            className="relative"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <WorldSnapshotPanel
                    title={t("overview.snapshotTitle")}
                    weekMinutesLabel={t("overview.chipWeekMinutes")}
                    wellbeingLabel={t("overview.chipWellbeing")}
                    streakLabel={t("overview.chipStreak") ?? "Streak"}
                    weekMinutes={data.snapshot.weekMinutes}
                    wellbeingScore={data.snapshot.wellbeingScore}
                    meditationStreakDays={data.snapshot.meditationStreakDays}
                    trendData={[32, 35, 30, 40, 45, 42, 40]}
                    trendTitle={t("overview.trendTitle")}
                    last7DaysLabel={t("overview.last7Days")}
                    wellbeingBarLabel={t("overview.wellbeingBarLabel")}
                    statusImproveLabel={t("overview.statusImprove")}
                    statusStableLabel={t("overview.statusStable")}
                />

                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-800">
                            {t("overview.recentBadgesTitle")}
                        </div>

                        <button
                            type="button"
                            onClick={onOpenBadges}
                            className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                        >
                            {t("overview.viewAll")}
                        </button>
                    </div>

                    <div className="mt-3">
                        <WorldBadgesStrip />
                    </div>
                </div>
            </div>
        </CardShell>
    );
}
