// components/world/ui/DottedSparkline.tsx
"use client";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export function DottedSparkline({
                                    data,
                                    height = 44,
                                    dots = 7,
                                    tone = "blue",
                                }: {
    data: number[]; // e.g. 7 values
    height?: number;
    dots?: number;
    tone?: "blue" | "purple" | "green";
}) {
    const w = 160;
    const h = height;

    const d = data.slice(-dots);
    const min = Math.min(...d);
    const max = Math.max(...d);

    const padX = 10;
    const padY = 8;

    const toneFill =
        tone === "green"
            ? "#10b981"
            : tone === "purple"
                ? "#8b5cf6"
                : "#3b82f6";

    const xs = d.map((_, i) => padX + (i * (w - padX * 2)) / Math.max(1, d.length - 1));
    const ys = d.map((v) => {
        const t = max === min ? 0.5 : (v - min) / (max - min);
        const y = h - padY - t * (h - padY * 2);
        return clamp(y, padY, h - padY);
    });

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full">
            {/* baseline very soft */}
            <line
                x1={padX}
                y1={h - padY}
                x2={w - padX}
                y2={h - padY}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* dots */}
            {xs.map((x, i) => (
                <g key={i}>
                    <circle cx={x} cy={ys[i]} r="4" fill={toneFill} fillOpacity="0.85" />
                    <circle cx={x} cy={ys[i]} r="9" fill={toneFill} fillOpacity="0.10" />
                </g>
            ))}
        </svg>
    );
}
