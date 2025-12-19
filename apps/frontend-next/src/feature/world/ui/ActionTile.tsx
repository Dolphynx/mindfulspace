"use client";

import React from "react";

type Tone = "blue" | "purple" | "green";

const toneStyles: Record<Tone, { rail: string; glow: string; cta: string }> = {
    blue: {
        rail: "bg-blue-500/70",
        glow: "bg-blue-200/25",
        cta: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    purple: {
        rail: "bg-violet-500/70",
        glow: "bg-violet-200/25",
        cta: "bg-violet-600 hover:bg-violet-700 text-white",
    },
    green: {
        rail: "bg-emerald-500/70",
        glow: "bg-emerald-200/25",
        cta: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
};

export function ActionTile({
                               title,
                               subtitle,
                               ctaLabel,
                               onClick,
                               tone = "blue",
                           }: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    onClick: () => void;
    tone?: Tone;
}) {
    const s = toneStyles[tone];

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/65 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]">
            {/* glow */}
            <div className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl ${s.glow}`} />
            {/* rail */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${s.rail}`} />

            <div className="flex items-center justify-between gap-4 p-4 pl-5">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="mt-1 text-xs text-slate-600">{subtitle}</div>
                </div>

                <button
                    type="button"
                    onClick={onClick}
                    className={[
                        "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition",
                        s.cta,
                        "focus:outline-none focus:ring-2 focus:ring-black/10",
                    ].join(" ")}
                >
                    {ctaLabel}
                </button>
            </div>
        </div>
    );
}
