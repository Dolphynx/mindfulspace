"use client";

/**
 * @file TodaySection.tsx
 * @description
 * Section “Aujourd’hui” de l’overview du World Hub.
 *
 * Cette section regroupe :
 * - le plan du jour (exercices) via un composant dédié,
 * - des actions transverses sous forme de tuiles (Quick Log, démarrer une session, programmes),
 * - un CTA d’accès rapide au Quick Log placé dans l’en-tête de la carte.
 *
 * Le composant est purement “composition UI” :
 * - pas de logique métier,
 * - la navigation est déléguée à des handlers fournis en props.
 */

import { TodayExercices } from "@/components/exercise/ExerciceDayPlan";
import { CardShell } from "@/feature/world/views/shared/CardShell";
import { ActionTile } from "@/feature/world/ui/ActionTile";

/**
 * Propriétés du composant {@link TodaySection}.
 */
export type TodaySectionProps = {
    /**
     * Fonction de traduction pour le namespace `world`.
     */
    t: (key: string) => string;

    /**
     * Handler d’ouverture du panneau Quick Log.
     */
    onOpenQuickLog: () => void;

    /**
     * Handler d’ouverture du panneau de démarrage de session.
     */
    onOpenStartSession: () => void;

    /**
     * Handler d’ouverture du panneau Programmes.
     */
    onOpenPrograms: () => void;
};

/**
 * Section “Aujourd’hui” (plan du jour + tuiles d’actions).
 *
 * Structure :
 * - Enveloppe `CardShell` avec un bouton d’action à droite (Quick Log).
 * - Grille en deux colonnes sur large écran :
 *   - gauche : plan du jour (exercices),
 *   - droite : actions transverses (3 tuiles + un hint).
 *
 * @param props - Propriétés du composant.
 * @returns Section “Aujourd’hui”.
 */
export function TodaySection(props: TodaySectionProps) {
    const { t, onOpenQuickLog, onOpenStartSession, onOpenPrograms } = props;

    return (
        <CardShell
            title={t("overview.todayTitle")}
            right={
                <button
                    type="button"
                    className="rounded-xl bg-white/60 hover:bg-white/80 transition px-3 py-2 text-xs text-slate-700"
                    onClick={onOpenQuickLog}
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
                        <TodayExercices />
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
                            onClick={onOpenQuickLog}
                        />

                        <ActionTile
                            tone="purple"
                            title={t("overview.startSessionCta")}
                            subtitle={t("overview.startSessionSubtitle")}
                            ctaLabel={t("overview.startSessionCta")}
                            onClick={onOpenStartSession}
                        />

                        <ActionTile
                            tone="green"
                            title={t("overview.programsCta")}
                            subtitle={t("overview.programsSubtitle")}
                            ctaLabel={t("overview.viewDetail")}
                            onClick={onOpenPrograms}
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
