/**
 * @file MeditationHistoryDetails.tsx
 * @description
 * Rendu “présentationnel” de la liste détaillée de l’historique des méditations.
 *
 * @remarks
 * - Ce composant ne gère aucun état et ne fait aucun appel réseau.
 * - Il s’appuie sur des données déjà préparées (groupes, typeMap).
 */

import Image from "next/image";
import { getMood } from "@/lib";
import type { MeditationSession, MeditationTypeItem } from "@/hooks/useMeditationSessions";
import type { GroupedMeditationDay } from "@/lib/meditation/meditationHistory";

/**
 * Propriétés du composant {@link MeditationHistoryDetails}.
 */
export type MeditationHistoryDetailsProps = {
    /**
     * Fonction de traduction (namespace `domainMeditation` attendu).
     */
    t: (k: string) => string;

    /**
     * Groupes de séances par jour (max 7).
     */
    grouped: GroupedMeditationDay[];

    /**
     * Index typeId -> type (pour slug/label).
     */
    typeMap: Record<string, MeditationTypeItem>;
};

/**
 * Affiche la liste détaillée des séances groupées par jour.
 *
 * @param props Voir {@link MeditationHistoryDetailsProps}.
 */
export function MeditationHistoryDetails({ t, grouped, typeMap }: MeditationHistoryDetailsProps) {
    if (grouped.length === 0) return null;

    return (
        <ul className="mt-4 space-y-4">
            {grouped.map((g, idx) => {
                const sessionCount = g.items.length;
                const isMostRecent = idx === grouped.length - 1;

                return (
                    <li
                        key={g.date}
                        className={`relative rounded-2xl border px-4 py-3 shadow-sm ${
                            isMostRecent ? "border-teal-100 bg-teal-50/70" : "border-slate-100 bg-slate-50"
                        }`}
                    >
                        <span className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-teal-300 to-violet-300" />

                        <div className="pl-3">
                            <div className="mb-3 flex items-baseline justify-between gap-2">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {t("last7_dayLabel")} {g.date}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <span className="rounded-full bg-white/70 px-2 py-0.5 font-medium shadow-sm">
                                        {g.totalMinutes} min {t("last7_totalLabel")}
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                        {sessionCount} séance{sessionCount > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            <ul className="mt-3 space-y-2">
                                {g.items.map((s, index) => {
                                    const minutes = Math.round(s.durationSeconds / 60);

                                    const typeSlug =
                                        s.meditationTypeId && typeMap[s.meditationTypeId]?.slug
                                            ? typeMap[s.meditationTypeId]!.slug
                                            : null;

                                    const typeLabel =
                                        typeSlug != null ? t(`meditationTypes.${typeSlug}.name`) : null;

                                    const mood = s.moodAfter != null ? getMood(s.moodAfter) : null;

                                    return (
                                        <li
                                            key={`${g.date}-${index}`}
                                            className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                {typeLabel && (
                                                    <span className="inline-flex max-w-[180px] items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                                                        {typeLabel}
                                                    </span>
                                                )}
                                                <span className="text-sm text-slate-600">{minutes} min</span>
                                            </div>

                                            {mood && (
                                                <button type="button" title={t(mood.label)} className="group">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 shadow-inner transition-transform group-hover:scale-105">
                                                        <Image
                                                            src={mood.emoji}
                                                            alt={t(mood.label)}
                                                            width={24}
                                                            height={24}
                                                            className="h-6 w-6"
                                                        />
                                                    </div>
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
