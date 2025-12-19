// components/world/ui/CardShell.tsx
"use client";

import React from "react";
import clsx from "clsx";

export function CardShell({
                              title,
                              subtitle,
                              right,
                              children,
                              className,
                          }: {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={clsx(
                "rounded-3xl bg-white/70 backdrop-blur-sm",
                "border border-slate-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
                "p-6",
                className
            )}
        >
            {(title || right) && (
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                        )}
                    </div>
                    {right}
                </header>
            )}

            {children}
        </section>
    );
}
