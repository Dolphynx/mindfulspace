"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";
import { usePrograms } from "@/hooks/usePrograms";
import { ProgramsList } from "./ProgramsList";
import {ProgramDetails} from "@/components/exercise/ProgramDetails";

export function WorkoutProgramsStartCard() {
    const t = useTranslations("domainExercice");
    const { programs, loading } = usePrograms();

    const [showList, setShowList] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

    if (showList && selectedProgramId) {
        return (
            <ProgramDetails
                program={programs.find(p => p.id === selectedProgramId)!}
                onBack={() => setSelectedProgramId(null)}
                onSubscribe={() => console.log("TODO subscribe")}
            />
        );
    }

    if (showList) {
        return (
            <ProgramsList
                programs={programs}
                loading={loading}
                onCancel={() => setShowList(false)}
                onSelect={setSelectedProgramId}
            />
        );
    }


    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">
                    {t("program_start_title")}
                </h3>
                <p className="text-sm text-slate-700">
                    {t("program_start_description")}
                </p>
            </div>

            <button
                onClick={() => setShowList(true)}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-emerald-600 transition"
            >
                {t("program_start_button")}
            </button>
        </div>
    );
}
