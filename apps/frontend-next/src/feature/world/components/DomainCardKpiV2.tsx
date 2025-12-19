"use client";

import { DottedSparkline } from "@/feature/world/ui/DottedSparkline";

type Tone = "blue" | "purple" | "green";

function toneClasses(tone: Tone) {
    if (tone === "green") {
        return {
            glow: "bg-emerald-200/20",
            rail: "bg-emerald-500/60",
            primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
            chip: "bg-emerald-50/60 border-emerald-100 text-emerald-900",
        };
    }
    if (tone === "purple") {
        return {
            glow: "bg-violet-200/20",
            rail: "bg-violet-500/60",
            primary: "bg-violet-600 hover:bg-violet-700 text-white",
            chip: "bg-violet-50/60 border-violet-100 text-violet-900",
        };
    }
    return {
        glow: "bg-blue-200/20",
        rail: "bg-blue-500/60",
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        chip: "bg-blue-50/60 border-blue-100 text-blue-900",
    };
}

function splitKpi(text: string) {
    // attend "Label : value"
    const idx = text.indexOf(":");
    if (idx === -1) return { label: "", value: text.trim() };
    return {
        label: text.slice(0, idx + 1).trim(),
        value: text.slice(idx + 1).trim(),
    };
}

export function DomainCardKpiV2(props: {
    title: string;
    subtitle: string;
    kpiA: string;
    kpiB: string;
    footnote: string;
    primaryCta: string;
    secondaryCta: string;
    onOpen: () => void;
    onQuickLog: () => void;
    tone?: Tone;
    sparklineData?: number[]; // fake data now, real later
    sparklineLabel?: string;  // ex: "7 jours"
}) {
    const tone: Tone = props.tone ?? "blue";
    const s = toneClasses(tone);

    const kA = splitKpi(props.kpiA);
    const kB = splitKpi(props.kpiB);

    const spark = props.sparklineData ?? [10, 12, 9, 14, 12, 13, 11];

    return (
        <section
            className={[
                "relative overflow-hidden rounded-[28px] bg-white/60 backdrop-blur-xl",
                "border border-white/40 shadow-[0_20px_60px_rgba(15,23,42,0.10)]",
                "p-5 transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] hover:-translate-y-[1px]",
            ].join(" ")}
        >
            {/* glow */}
            <div className={`pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />
            <div className={`pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full blur-3xl ${s.glow}`} />

            {/* rail */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${s.rail}`} />

            {/* header */}
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {props.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{props.subtitle}</p>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {props.sparklineLabel ?? "7 jours"}
                </div>
            </header>

            {/* KPI chips + sparkline */}
            <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-600">{kA.label}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{kA.value}</div>
                    </div>

                    <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                        <div className="text-xs font-semibold text-slate-600">{kB.label}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{kB.value}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                {props.subtitle}
                            </div>
                            <div className="mt-1 text-xs text-slate-600">{props.footnote}</div>
                        </div>

                        <div className="w-44 shrink-0">
                            <DottedSparkline data={spark} tone={tone} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={props.onOpen}
                    className={[
                        "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition",
                        s.primary,
                    ].join(" ")}
                >
                    {props.primaryCta}
                </button>

                <button
                    type="button"
                    onClick={props.onQuickLog}
                    className="rounded-2xl border border-white/50 bg-white/65 hover:bg-white/85 transition px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm"
                >
                    {props.secondaryCta}
                </button>
            </div>
        </section>
    );
}
