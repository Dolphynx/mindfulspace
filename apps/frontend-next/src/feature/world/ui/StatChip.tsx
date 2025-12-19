// components/world/ui/StatChip.tsx
"use client";

export function StatChip({
                             label,
                             value,
                             tone = "neutral",
                         }: {
    label: string;
    value: string;
    tone?: "neutral" | "blue" | "purple" | "green";
}) {
    const toneClass =
        tone === "blue"
            ? "bg-blue-50/70 text-blue-900 border-blue-100"
            : tone === "purple"
                ? "bg-violet-50/70 text-violet-900 border-violet-100"
                : tone === "green"
                    ? "bg-emerald-50/70 text-emerald-900 border-emerald-100"
                    : "bg-slate-50/70 text-slate-900 border-slate-100";

    return (
        <div
            className={[
                "inline-flex items-baseline gap-2 rounded-2xl border px-4 py-3",
                toneClass,
            ].join(" ")}
        >
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <span className="text-base font-semibold">{value}</span>
        </div>
    );
}
