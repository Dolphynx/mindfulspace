"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "@/i18n/TranslationContext";

import { ProgramsList } from "@/components/exercise/ProgramsList";
import { ProgramDetails } from "@/components/exercise/ProgramDetails";
import { usePrograms } from "@/hooks/usePrograms";
import { useWorldHub } from "../../hub/WorldHubProvider";

import type { ProgramItem } from "@/lib/api/program";

export function ProgramsView() {
    const tWorld = useTranslations("world");
    const tExercise = useTranslations("domainExercice");
    const { goBack, openOverview, canGoBack } = useWorldHub();

    const { programs: apiPrograms, loading } = usePrograms();
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

    // (Optionnel) fallback visuel si l’API ne renvoie rien
    const fallbackPrograms = useMemo<ProgramItem[]>(
        () => [
            /* ...ton fake data actuel... */
        ],
        []
    );

    const programsToShow = apiPrograms.length ? apiPrograms : fallbackPrograms;

    const selectedProgram =
        selectedProgramId ? programsToShow.find((p) => p.id === selectedProgramId) ?? null : null;

    // ✅ Vue détail
    if (selectedProgram) {
        return (
            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
                <ProgramDetails
                    program={selectedProgram}
                    onBack={() => setSelectedProgramId(null)} // ← retour liste
                />

                {/* Bonus utile : annuler depuis le détail ferme la vue programs */}
                <button
                    type="button"
                    onClick={() => {
                        setSelectedProgramId(null);
                        if (canGoBack) goBack();
                        else openOverview();
                    }}
                    className="mt-4 text-sm text-slate-600 underline hover:text-slate-800"
                >
                    {tExercise("manualForm_cancelButton")}
                </button>
            </div>
        );
    }

    // ✅ Vue liste
    return (
        <div className="space-y-4">
            <div>
                <div className="text-sm font-semibold text-slate-800">{tWorld("programs.title")}</div>
                <div className="mt-1 text-xs text-slate-500">{tWorld("domains.exercise")}</div>
            </div>

            <div className="flex items-center gap-3">
                <DomainSquare icon="/images/icone_exercise.png" label={tWorld("domains.exercise")} active />
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/55 backdrop-blur p-4 shadow-md">
                <ProgramsList
                    programs={programsToShow}
                    loading={loading}
                    onSelect={(id) => setSelectedProgramId(id)} // ✅ sélection => détail
                    onCancel={() => {
                        // ✅ "Annuler" ferme la vue ouverte (revient à l’overview via la stack)
                        if (canGoBack) goBack();
                        else openOverview();
                    }}
                />
            </div>
        </div>
    );
}

function DomainSquare({
                          icon,
                          label,
                          disabled,
                          active,
                      }: {
    icon: string;
    label: string;
    disabled?: boolean;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            aria-label={label}
            title={label}
            className={[
                "relative h-12 w-12 rounded-2xl overflow-hidden transition border",
                "bg-white/60 backdrop-blur",
                active ? "border-slate-300 shadow-sm" : "border-white/40",
                disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/80",
            ].join(" ")}
        >
            <Image src={icon} alt={label} fill className="object-contain p-2" />
        </button>
    );
}
