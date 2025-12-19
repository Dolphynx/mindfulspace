"use client";

/**
 * @file OverviewSkeletons.tsx
 * @description
 * Skeleton components used by the World overview dashboard while data is loading.
 */

/**
 * Skeleton placeholder for the snapshot panel area.
 *
 * @returns A skeleton panel component.
 */
export function SkeletonPanel() {
    return (
        <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
            <div className="h-4 w-24 rounded bg-white/70" />
            <div className="mt-3 flex gap-2">
                <div className="h-6 w-28 rounded-full bg-white/70" />
                <div className="h-6 w-28 rounded-full bg-white/70" />
                <div className="h-6 w-20 rounded-full bg-white/70" />
            </div>
            <div className="mt-4 h-12 rounded-2xl bg-white/60 border border-white/40" />
        </div>
    );
}

/**
 * Skeleton placeholder for a single domain card.
 *
 * @returns A skeleton card component.
 */
export function SkeletonCard() {
    return (
        <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur p-5">
            <div className="h-5 w-24 rounded bg-white/70" />
            <div className="mt-2 h-3 w-32 rounded bg-white/60" />
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-2xl bg-white/60 border border-white/40" />
                <div className="h-10 rounded-2xl bg-white/60 border border-white/40" />
            </div>
            <div className="mt-4 h-10 rounded-2xl bg-white/60" />
        </div>
    );
}
