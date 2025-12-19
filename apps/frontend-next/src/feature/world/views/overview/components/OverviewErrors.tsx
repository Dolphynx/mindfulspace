"use client";

/**
 * @file OverviewErrors.tsx
 * @description
 * Small error components used by the World overview dashboard when metrics cannot be loaded.
 */

/**
 * Minimal error panel variant used in the snapshot area.
 *
 * @param props - Component props.
 * @param props.title - Panel title.
 * @param props.message - Error message to display.
 * @returns An error panel component.
 */
export function ErrorPanel(props: { title: string; message: string }) {
    return (
        <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
            <div className="text-sm font-semibold text-slate-800">{props.title}</div>
            <div className="mt-2 text-xs text-slate-600">{props.message}</div>
        </div>
    );
}

/**
 * Minimal error card variant used in the domains grid.
 *
 * @param props - Component props.
 * @param props.message - Error message to display.
 * @returns An error card component.
 */
export function ErrorCard(props: { message: string }) {
    return (
        <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur p-5">
            <div className="h-5 w-24 rounded bg-white/70" />
            <div className="mt-2 text-xs text-slate-600">{props.message}</div>
        </div>
    );
}
