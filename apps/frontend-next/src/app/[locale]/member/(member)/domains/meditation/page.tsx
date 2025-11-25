"use client";

import PageHero from "@/components/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import {
    useMeditationSessions,
    type MeditationErrorType,
} from "@/hooks/useMeditationSessions";
import { MeditationHistoryCard } from "@/components/meditation";
import StartMeditationWizard from "@/components/meditation/StartMeditationWizard";
import {
    SessionDashboardLayout,
} from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import MeditationManualForm from "@/components/meditation/MeditationManualForm";
import { useState } from "react";

/**
 * Calcule un message d'erreur global à partir du type d'erreur métier.
 *
 * Cette fonction centralise la correspondance entre les codes d'erreur
 * (`load`, `save`, `types`) et les clés de traduction i18n afin de garder
 * la logique de mapping dans un endroit unique.
 *
 * @param t Fonction de traduction retournée par `useTranslations`.
 * @param errorType Type d'erreur courant (chargement, sauvegarde, types…).
 * @returns Message d'erreur localisé, ou `null` s'il n'y a pas d'erreur.
 */
function getErrorMessage(
    t: ReturnType<typeof useTranslations>,
    errorType: MeditationErrorType,
): string | null {
    if (errorType === "load") return t("errors.loadSessions");
    if (errorType === "save") return t("errors.saveSession");
    if (errorType === "types") return t("errors.loadTypes");
    return null;
}

/**
 * Page principale de gestion de la méditation.
 *
 * Elle orchestre :
 * - le chargement des séances et types via `useMeditationSessions`
 * - l'affichage du formulaire manuel de saisie de séance
 * - le wizard guidé de démarrage de méditation
 * - l’historique des 7 derniers jours de séances
 *
 * La page s'appuie sur un layout générique de tableau de bord (`SessionDashboardLayout`)
 * pour organiser les colonnes et le hero.
 */
export default function MeditationPage() {
    const t = useTranslations("domainMeditation");

    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useMeditationSessions();

    /**
     * Indique si le wizard de démarrage de méditation est actuellement ouvert.
     * Sert à piloter les transitions d’animation et l’affichage conditionnel.
     */
    const [isStartWizardOpen, setIsStartWizardOpen] = useState(false);

    const globalErrorMessage = getErrorMessage(t, errorType);

    return (
        <main className="text-brandText flex flex-col">
            <SessionDashboardLayout
                hero={
                    <PageHero
                        title={t("title")}
                        subtitle={t("subtitle")}
                    />
                }
                globalErrorMessage={globalErrorMessage}
                leftTop={
                    <SessionCard>
                        <MeditationManualForm
                            types={types}
                            onCreateSession={createSession}
                        />
                    </SessionCard>
                }
                leftBottom={
                    <SessionCard>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        {t("player_title")}
                                    </h2>
                                    <p className="text-sm text-slate-700">
                                        {t("player_description")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsStartWizardOpen(true)}
                                    className={`rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-white transition-all duration-500 ${
                                        isStartWizardOpen
                                            ? "opacity-0 scale-95 pointer-events-none"
                                            : "opacity-100 scale-100"
                                    }`}
                                    disabled={types.length === 0}
                                    type="button"
                                >
                                    {t("player_startButton")}
                                </button>
                            </div>

                            <div
                                className={`transition-all duration-700 overflow-hidden ${
                                    isStartWizardOpen
                                        ? "max-h-[900px] opacity-100 mt-2"
                                        : "max-h-0 opacity-0"
                                }`}
                            >
                                {isStartWizardOpen && (
                                    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                                        <StartMeditationWizard
                                            onCloseAction={() =>
                                                setIsStartWizardOpen(false)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </SessionCard>
                }
                rightColumn={
                    <MeditationHistoryCard
                        sessions={sessions}
                        loading={loading}
                        errorType={errorType}
                        types={types}
                    />
                }
            />
        </main>
    );
}
