"use client";

/**
 * @file TodaySection.tsx
 * @description
 * Overview "Today" section. Renders the daily plan and the transversal actions.
 */

import { TodayExercices } from "@/components/exercise/ExerciceDayPlan";
import { CardShell } from "@/feature/world/views/shared/CardShell";
import { ActionTile } from "@/feature/world/ui/ActionTile";

/**
 * Props for {@link TodaySection}.
 */
export type TodaySectionProps = {
    /**
     * Translation function for the "world" namespace.
     */
    t: (key: string) => string;

    /**
     * Handler to open the Quick Log panel.
     */
    onOpenQuickLog: () => void;

    /**
     * Handler to open the Start Session panel.
     */
    onOpenStartSession: () => void;

    /**
     * Handler to open the Programs panel.
     */
    onOpenPrograms: () => void;
};

/**
 * Today section (daily plan + action tiles).
 *
 * @param props - Component props.
 * @returns A section component.
 */
export function TodaySection(props: TodaySectionProps) {
    const { t, onOpenQuickLog, onOpenStartSession, onOpenPrograms } = props;

    return (
        <CardShell
            title={t("overview.todayTitle")}
            right={
                <button
                    type="button"
                    className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                    onClick={onOpenQuickLog}
                >
                    {t("overview.quickLogCta")}
                </button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("overview.todayExercisesTitle")}
                    </div>
                    <div className="mt-3">
                        <TodayExercices />
                    </div>
                </div>

                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("overview.todayActionsTitle")}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                        <ActionTile
                            tone="blue"
                            title={t("overview.encodeSessionCta")}
                            subtitle={t("overview.encodeSessionSubtitle")}
                            ctaLabel={t("overview.quickLogCta")}
                            onClick={onOpenQuickLog}
                        />

                        <ActionTile
                            tone="purple"
                            title={t("overview.startSessionCta")}
                            subtitle={t("overview.startSessionSubtitle")}
                            ctaLabel={t("overview.startSessionCta")}
                            onClick={onOpenStartSession}
                        />

                        <ActionTile
                            tone="green"
                            title={t("overview.programsCta")}
                            subtitle={t("overview.programsSubtitle")}
                            ctaLabel={t("overview.viewDetail")}
                            onClick={onOpenPrograms}
                        />
                    </div>

                    <div className="mt-4 text-xs text-slate-500">{t("overview.todayActionsHint")}</div>
                </div>
            </div>
        </CardShell>
    );
}
