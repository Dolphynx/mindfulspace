// components/world/ui/SoftProgress.tsx
"use client";

export function SoftProgress({
                                 value,
                                 tone = "blue",
                                 labelLeft,
                                 labelRight,
                             }: {
    value: number; // 0..100
    tone?: "blue" | "purple" | "green";
    labelLeft?: string;
    labelRight?: string;
}) {
    const cl =
        tone === "green"
            ? "from-emerald-400/70 to-emerald-600/70"
            : tone === "purple"
                ? "from-violet-400/70 to-violet-600/70"
                : "from-blue-400/70 to-blue-600/70";

    const v = Math.max(0, Math.min(100, value));

    return (
        <div>
            {(labelLeft || labelRight) && (
                <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                    <span>{labelLeft}</span>
                    <span>{labelRight}</span>
                </div>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${cl}`}
                    style={{ width: `${v}%` }}
                />
            </div>
        </div>
    );
}
