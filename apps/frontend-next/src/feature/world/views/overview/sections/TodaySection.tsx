"use client";

/**
 * @file TodaySection.tsx
 * @description
 * Section “Aujourd’hui” de l’overview du World Hub.
 *
 * Cette section regroupe :
 * - le plan du jour (exercices) via {@link TodayExercises},
 * - des actions transverses sous forme de tuiles via {@link ActionTile},
 * - un CTA d’accès rapide au Quick Log placé dans l’en-tête de la carte.
 *
 * Contrat d’architecture :
 * - Les composants UI reçoivent des props sérialisables.
 * - Les actions interactives sont déclenchées côté client via le hub.
 *   (Évite TS71007 : fonctions non sérialisables en props.)
 */

import { TodayExercises } from "@/components/exercise/ExerciseDayPlan";
import { CardShell } from "@/feature/world/views/shared/CardShell";
import { ActionTile } from "@/feature/world/ui/ActionTile";
import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "@/feature/world/hub/WorldHubProvider";

/**
 * Section “Aujourd’hui” (plan du jour + tuiles d’actions).
 *
 * @returns Section “Aujourd’hui”.
 */
export function TodaySection() {
    const t = useTranslations("world");
    const { openQuickLog } = useWorldHub();

    return (
        <CardShell
            title={t("overview.todayTitle")}
            right={
                <button
                    type="button"
                    className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                    onClick={() => openQuickLog()}
                >
                    {t("overview.quickLogCta")}
                </button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("overview.todayExercisesTitle")}
                    </div>
                    <div className="mt-3">
                        <TodayExercises />
                    </div>
                </div>

                <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("overview.todayActionsTitle")}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                        <ActionTile
                            tone="blue"
                            title={t("overview.encodeSessionCta")}
                            subtitle={t("overview.encodeSessionSubtitle")}
                            ctaLabel={t("overview.quickLogCta")}
                            action="quickLog"
                        />

                        <ActionTile
                            tone="purple"
                            title={t("overview.startSessionCta")}
                            subtitle={t("overview.startSessionSubtitle")}
                            ctaLabel={t("overview.startSessionCta")}
                            action="startSession"
                        />

                        <ActionTile
                            tone="green"
                            title={t("overview.programsCta")}
                            subtitle={t("overview.programsSubtitle")}
                            ctaLabel={t("overview.viewDetail")}
                            action="programs"
                        />
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                        {t("overview.todayActionsHint")}
                    </div>
                </div>
            </div>
        </CardShell>
    );
}
