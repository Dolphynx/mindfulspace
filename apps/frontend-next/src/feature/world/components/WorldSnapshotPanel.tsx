"use client";

// + import
import { DottedSparkline } from "@/feature/world/ui/DottedSparkline";
import { StatChip } from "@/feature/world/ui/StatChip";
import { SoftProgress } from "@/feature/world/ui/SoftProgress";

type Props = {
    title: string;
    weekMinutesLabel: string;
    wellbeingLabel: string;
    streakLabel: string;
    weekMinutes: number;
    wellbeingScore: number;
    meditationStreakDays: number;
    trendData?: number[];
    trendTitle: string;          // "Tendance"
    last7DaysLabel: string;      // "7 derniers jours"
    wellbeingBarLabel: string;   // "Bien-être"
    statusImproveLabel: string;  // "À améliorer"
    statusStableLabel: string;   // "Stable"
};

export function WorldSnapshotPanel(props: Props) {
    const trend = props.trendData ?? [32, 35, 30, 40, 45, 42, 40];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/60 border border-white/40 p-4">
            {/* subtle glows */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-14 h-52 w-52 rounded-full bg-violet-200/20 blur-3xl" />

            <div className="text-sm font-semibold text-slate-800">{props.title}</div>

            {/* chips */}
            <div className="mt-3 flex flex-wrap gap-2">
                <StatChip label={props.weekMinutesLabel} value={`${props.weekMinutes} min`} />
                <StatChip label={props.wellbeingLabel} value={`${props.wellbeingScore}/100`} />
                <StatChip label={props.streakLabel} value={`${props.meditationStreakDays}`} />
            </div>

            {/* sparkline + progress */}
            <div className="mt-4 rounded-2xl border border-white/40 bg-white/55 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {props.trendTitle}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">{props.last7DaysLabel}</div>
                    </div>

                    <div className="w-48">
                        <DottedSparkline data={trend} tone="blue" />
                    </div>
                </div>

                <div className="mt-4">
                    <SoftProgress
                        value={props.wellbeingScore}
                        tone="purple"
                        labelLeft={props.wellbeingBarLabel}
                        labelRight={
                            props.wellbeingScore < 50 ? props.statusImproveLabel : props.statusStableLabel
                        }
                    />
                </div>
            </div>
        </div>
    );
}
