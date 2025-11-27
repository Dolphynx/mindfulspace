"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { WorkoutStartSessionCard } from "./WorkoutStartSessionCard";
import type { WorkoutTypeItem, CreateWorkoutSessionPayload } from "@/lib/api/workout";

type Props = {
    types: WorkoutTypeItem[];
    onCreateSession: (payload: CreateWorkoutSessionPayload) => Promise<void>;
};

export function WorkoutStartSection({ types, onCreateSession }: Props) {
    const t = useTranslations("domainExercice");

    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Header + Start button (visible when closed) */}
            {!open && (
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {t("start_title")}
                        </h2>
                        <p className="text-sm text-slate-700">
                            {t("start_description")}
                        </p>
                    </div>

                    <button
                        className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition"
                        onClick={() => setOpen(true)}
                        disabled={types.length === 0}
                        type="button"
                    >
                        {t("start_button")}
                    </button>
                </div>
            )}

            {/* Animated block for the guided session */}
            <div
                className={`transition-all duration-500 overflow-hidden ${
                    open ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
            >
                {open && (
                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                        <WorkoutStartSessionCard
                            types={types}
                            onSave={async ({ exerciceTypeId, repetitionCount, quality }) => {
                                await onCreateSession({
                                    dateSession: new Date().toISOString(),
                                    quality: quality ?? undefined,
                                    exercices: [{ exerciceTypeId, repetitionCount }],
                                });

                                setOpen(false); // ⬅ CLOSE after finishing
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
