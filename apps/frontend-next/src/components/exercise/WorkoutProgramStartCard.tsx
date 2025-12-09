"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { useWorkoutPrograms } from "@/hooks/useWorkoutPrograms";
import { WorkoutProgramsList } from "./WorkoutProgramsList";

export function WorkoutProgramsStartCard() {
    const t = useTranslations("domainExercice");
    const { programs, loading } = useWorkoutPrograms();

    const [showList, setShowList] = useState(false);

    if (showList) {
        return (
            <WorkoutProgramsList
                programs={programs}
                loading={loading}
                onCancel={() => setShowList(false)}
            />
        );
    }

    return (
        <div className="p-4 m-0 p-0">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {t("program_start_title")}
            </h3>

            <p className="text-sm text-slate-600 mb-4">
                {t("program_start_description")}
            </p>

            <button
                onClick={() => setShowList(true)}
                className="rounded-full bg-emerald-500 px-4 py-2 text-white font-medium shadow hover:bg-emerald-600 transition">
                {t("program_start_button")}
            </button>
        </div>
    );
}
