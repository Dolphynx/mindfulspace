"use client";

import { useState } from "react";
import sleepDataDefault from "@/data/sleepData.json";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { DotProps } from "recharts";

type SleepPoint = {
    day: string;
    hours: number;
};

// Type minimal pour le dot actif.
// On ne dépend plus d'un type interne non exporté par recharts.
type ActiveDotPropsLike = {
    cx?: number;
    cy?: number;
};

/**
 * Custom Dot for the normal state
 */
function CustomDot(props: DotProps) {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return null;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#4da884"
            stroke="#4da884"
            strokeWidth={2}
        />
    );
}

/**
 * Custom Dot for the active (hover) state
 * Must always return an element (not null) to satisfy Line.activeDot expectations
 */
function CustomActiveDot(props: ActiveDotPropsLike) {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") {
        // On rend un point invisible plutôt que null, pour rester typesafe
        return (
            <circle
                cx={0}
                cy={0}
                r={0}
                fill="transparent"
                stroke="transparent"
                strokeWidth={0}
            />
        );
    }
    return (
        <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#4da884"
            stroke="#ffffff"
            strokeWidth={2}
        />
    );
}

export default function SleepChartCard() {
    // Plus tard ça viendra de l'API Nest
    const [sleepData] = useState<SleepPoint[]>(sleepDataDefault);

    const displayedRange = "27/10 → 02/11";

    return (
        <section className="bg-white border border-[#d9eadf] rounded-xl shadow-sm flex flex-col">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-5 border-b border-[#d9eadf]">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                        Sleep Tracking
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Your sleep pattern over the last week
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 text-gray-800 text-lg">
                    <div className="font-medium text-gray-800">{displayedRange}</div>
                </div>
            </header>

            {/* Chart */}
            <div className="p-5 w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sleepData}
                        margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#d9eadf"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: "#4b5563" }}
                            tickLine={false}
                            axisLine={{ stroke: "#4b5563" }}
                        />

                        <YAxis
                            stroke="#4b5563"
                            tick={{ fontSize: 16, fill: "#4b5563" }}
                            tickLine={false}
                            axisLine={{ stroke: "#4b5563" }}
                            domain={[0, 12]}
                            ticks={[0, 3, 6, 9, 12]}
                        />

                        <Tooltip
                            cursor={{
                                stroke: "#94c5a9",
                                strokeWidth: 1,
                                strokeDasharray: "4 2",
                            }}
                            contentStyle={{
                                borderRadius: "0.5rem",
                                borderColor: "#d9eadf",
                                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.08)",
                                fontSize: "0.875rem",
                            }}
                            labelStyle={{
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "0.25rem",
                            }}
                            formatter={(value) => [`${value} h`, "Sleep"]}
                        />

                        <Line
                            type="monotone"
                            dataKey="hours"
                            stroke="#4da884"
                            strokeWidth={3}
                            dot={<CustomDot />}
                            activeDot={<CustomActiveDot />}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
