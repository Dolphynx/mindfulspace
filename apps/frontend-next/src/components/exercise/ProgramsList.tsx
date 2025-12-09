"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import type { ProgramItem } from "@/lib/api/program";

export function ProgramsList({programs, loading, onCancel, onSelect}: {
    programs: ProgramItem[];
    loading: boolean;
    onCancel: () => void;
    onSelect: (id: string) => void;
}) {
    const t = useTranslations("domainExercice");

    if (loading) return <p>{t("program_list_loading")}</p>;

    return (
        <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
                {t("program_list_title")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {programs.map((p) => {
                    const uniqueWeekdays = new Set(p.days.map(d => d.weekday)).size;

                    return (
                        <div key={p.id} className="p-4 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition">
                            <h4 className="text-base font-semibold text-slate-800">
                                {p.title}
                            </h4>

                            {p.description && (
                                <p className="text-sm text-slate-600 mt-1">
                                    {p.description}
                                </p>
                            )}

                            <p className="text-xs text-slate-500 mt-2">
                                {uniqueWeekdays} {t("program_list_daysPerWeek")}
                            </p>

                            <button
                                onClick={() => onSelect(p.id)}
                                className="mt-3 rounded-md bg-violet-500 px-3 py-1 text-white text-sm hover:bg-violet-600"
                            >
                                {t("program_list_seeDetails")}
                            </button>

                        </div>
                    );
                })}

            </div>

            <button
                type="button"
                onClick={onCancel}
                className="mt-2 text-sm text-slate-600 underline hover:text-slate-800"
            >
                {t("manualForm_cancelButton")}
            </button>
        </div>
    );
}
