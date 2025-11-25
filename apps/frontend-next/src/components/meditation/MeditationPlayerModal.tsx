"use client";

import { useState } from "react";
import type { MeditationTypeItem } from "@/lib/api/meditation";
import { useTranslations } from "@/i18n/TranslationContext";

type Props = {
    open: boolean;
    onCloseAction: () => void;
    onSaveAction: (data: {
        duration: number;
        quality: number | null;
        meditationTypeId: string;
    }) => Promise<void>;
    types: MeditationTypeItem[];
};

export function MeditationPlayerModal({
                                          open,
                                          onCloseAction,
                                          onSaveAction,
                                          types,
                                      }: Props) {
    const t = useTranslations("domainMeditation");

    const [duration, setDuration] = useState(10);
    const [quality, setQuality] = useState<number | null>(3);
    const [typeId, setTypeId] = useState<string>(types[0]?.id ?? "");

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="rounded-xl bg-white p-6 shadow-xl w-80">
                <h2 className="text-lg font-semibold mb-4">
                    {t("player_modalTitle")}
                </h2>

                <div className="mb-3">
                    <label className="text-xs text-slate-600">
                        {t("manualForm_typeLabel")}
                    </label>
                    <select
                        className="w-full rounded-md border px-2 py-1"
                        value={typeId}
                        onChange={(e) => setTypeId(e.target.value)}
                    >
                        {types.map((type) => (
                            <option key={type.id} value={type.id}>
                                {t(
                                    `meditationTypes.${type.slug}.name`,
                                )}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="text-xs text-slate-600">
                        {t("player_durationLabel")} : {duration} min
                    </label>
                    <input
                        type="range"
                        min={5}
                        max={60}
                        value={duration}
                        step={5}
                        onChange={(e) =>
                            setDuration(Number(e.target.value))
                        }
                        className="w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="text-xs text-slate-600">
                        {t("player_finishedQualityLabel")}
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={quality ?? ""}
                        onChange={(e) =>
                            setQuality(
                                e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            )
                        }
                        className="w-full rounded-md border px-2 py-1"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        className="px-3 py-1 text-sm"
                        onClick={onCloseAction}
                    >
                        {t("player_stopEarlyButton")}
                    </button>

                    <button
                        className="px-3 py-1 bg-sky-500 text-white rounded-md text-sm"
                        onClick={async () =>
                            onSaveAction({
                                duration,
                                quality,
                                meditationTypeId: typeId,
                            })
                        }
                    >
                        {t("player_saveButton")}
                    </button>
                </div>
            </div>
        </div>
    );
}
