"use client";

import React from "react";

type Tone = "slate" | "blue" | "purple" | "green";

function toneClasses(tone: Tone) {
    switch (tone) {
        case "blue":
            return {
                ring: "ring-sky-100",
                bar: "from-sky-300 to-violet-300",
                chip: "bg-sky-50 text-sky-700 border-sky-100",
            };
        case "purple":
            return {
                ring: "ring-violet-100",
                bar: "from-violet-300 to-teal-300",
                chip: "bg-violet-50 text-violet-700 border-violet-100",
            };
        case "green":
            return {
                ring: "ring-emerald-100",
                bar: "from-emerald-300 to-teal-300",
                chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
            };
        default:
            return {
                ring: "ring-slate-100",
                bar: "from-slate-300 to-slate-200",
                chip: "bg-slate-50 text-slate-700 border-slate-100",
            };
    }
}

export function Section(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-700">{props.title}</h3>
                {props.right}
            </div>
            {props.children}
        </section>
    );
}

export function Sparkline(props: { values: number[] }) {
    const values = props.values ?? [];
    const w = 520;
    const h = 120;
    const pad = 8;

    if (values.length <= 1) {
        return <div className="h-[120px] rounded-xl bg-slate-50 border border-slate-100" />;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1e-6, max - min);

    const pts = values
        .map((v, i) => {
            const x = pad + (i * (w - pad * 2)) / (values.length - 1);
            const y = pad + (1 - (v - min) / span) * (h - pad * 2);
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div className="overflow-hidden rounded-2xl bg-white/80 border border-slate-100">
            <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-[120px]">
                <polyline
                    points={pts}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-slate-400"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

// ---------- Visuals (donut, rating, pills) ----------

function Donut(props: { pct: number; tone?: Tone; label?: string }) {
    const pct = Math.max(0, Math.min(100, Math.round(props.pct)));
    const r = 18;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;

    const tone = toneClasses(props.tone ?? "slate");

    return (
        <div className="flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
                <circle cx="22" cy="22" r={r} strokeWidth="6" className="text-slate-200" stroke="currentColor" fill="none" />
                <circle
                    cx="22"
                    cy="22"
                    r={r}
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    className="text-slate-500"
                    style={{
                        strokeDasharray: `${dash} ${c - dash}`,
                        transform: "rotate(-90deg)",
                        transformOrigin: "22px 22px",
                    }}
                />
            </svg>

            <div className="min-w-0">
                <div className="text-xs text-slate-500">{props.label}</div>
                <div className="text-sm font-semibold text-slate-800">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 ${tone.chip}`}>{pct}%</span>
                </div>
            </div>
        </div>
    );
}

function RatingPips(props: { value: number; max?: number; tone?: Tone }) {
    const max = props.max ?? 5;
    const v = Math.max(0, Math.min(max, Math.round(props.value)));
    const tone = props.tone ?? "slate";
    const t = toneClasses(tone);

    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < v;
                return (
                    <span
                        key={i}
                        className={[
                            "h-2.5 w-2.5 rounded-full border",
                            filled ? t.chip : "bg-white border-slate-200",
                        ].join(" ")}
                    />
                );
            })}
            <span className="ml-2 text-xs text-slate-500">{v}/{max}</span>
        </div>
    );
}

function Pills(props: { items: string[]; emptyLabel: string; tone?: Tone; max?: number }) {
    const max = props.max ?? 3;
    const items = props.items.filter(Boolean);
    const shown = items.slice(0, max);
    const rest = Math.max(0, items.length - shown.length);
    const t = toneClasses(props.tone ?? "slate");

    if (items.length === 0) {
        return <span className="text-sm text-slate-500">{props.emptyLabel}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {shown.map((it) => (
                <span
                    key={it}
                    className={`max-w-[220px] truncate rounded-full border px-2 py-0.5 text-xs ${t.chip}`}
                    title={it}
                >
          {it}
        </span>
            ))}
            {rest > 0 && (
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
          +{rest}
        </span>
            )}
        </div>
    );
}

type KpiVisual =
    | { kind: "donut"; pct: number; label: string }
    | { kind: "rating"; value: number; max?: number }
    | { kind: "pills"; items: string[]; emptyLabel: string; max?: number };

export function KpiCard(props: {
    label: string;
    value: string;
    hint?: string;
    tone?: Tone;
    visual?: KpiVisual;
}) {
    const tone = props.tone ?? "slate";
    const t = toneClasses(tone);

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-white/90 border border-slate-100 shadow-sm ring-1 ${t.ring}`}>
            <span className={`pointer-events-none absolute inset-y-3 left-3 w-1 rounded-full bg-gradient-to-b ${t.bar}`} />

            <div className="p-5 pl-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {props.label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">{props.value}</div>

                        {props.hint && (
                            <div className="mt-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${t.chip}`}>
                  {props.hint}
                </span>
                            </div>
                        )}
                    </div>

                    {props.visual && (
                        <div className="shrink-0 pt-1">
                            {props.visual.kind === "donut" && (
                                <Donut pct={props.visual.pct} label={props.visual.label} tone={tone} />
                            )}
                            {props.visual.kind === "rating" && (
                                <RatingPips value={props.visual.value} max={props.visual.max} tone={tone} />
                            )}
                            {props.visual.kind === "pills" && (
                                <div className="max-w-[240px]">
                                    <Pills
                                        items={props.visual.items}
                                        emptyLabel={props.visual.emptyLabel}
                                        tone={tone}
                                        max={props.visual.max}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
