"use client";

import PageHero from "@/components/layout/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import {
    useMeditationSessions,
    type MeditationErrorType,
} from "@/hooks/useMeditationSessions";
import { MeditationHistoryCard } from "@/components/meditation";
import { useAuthRequired } from "@/hooks/useAuthRequired";
import StartMeditationWizard from "@/components/meditation/StartMeditationWizard";
import {
    SessionDashboardLayout,
} from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import MeditationManualForm from "@/components/meditation/MeditationManualForm";
import { useState } from "react";
import DomainSwitcher from "@/components/shared/DomainSwitcher";
import OceanWavesBackground from "@/components/layout/OceanWavesBackground";

/**
 * Génère un message d’erreur global en fonction du type d’échec métier.
 *
 * Centralise la correspondance entre les codes d’erreur internes
 * (`load`, `save`, `types`) et les clés de traduction i18n.
 * Cela évite que la logique de mapping soit dupliquée ailleurs
 * dans l’interface.
 *
 * @param t Fonction de traduction obtenue via `useTranslations`.
 * @param errorType Type d’erreur renvoyé par `useMeditationSessions`.
 * @returns Message d’erreur utilisateur ou `null` s’il n’y a pas d’erreur.
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
 * Page principale du domaine “Méditation”.
 *
 * Elle regroupe :
 * - l’historique des séances,
 * - le formulaire manuel,
 * - le wizard de démarrage d’une nouvelle séance,
 * - le sélecteur de domaine,
 * - le layout générique des pages de sessions.
 *
 * Le comportement premium / non-premium est géré via `useAuthRequired`
 * et transmis au wizard via `canAccessPremium`.
 */
export default function MeditationPage() {
    const t = useTranslations("domainMeditation");

    // Données métier : dernières sessions, types disponibles, erreurs, etc.
    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useMeditationSessions();

    // Affichage du wizard
    const [isStartWizardOpen, setIsStartWizardOpen] = useState(false);

    // Message d’erreur global pour le layout
    const globalErrorMessage = getErrorMessage(t, errorType);

    // Utilisateur connecté (+ rôles)
    const { user } = useAuthRequired();

    /**
     * Détermine si l’utilisateur peut accéder aux contenus premium.
     *
     * Le backend renvoie `roles: string[]`, déjà normalisés par `useAuthRequired`
     * (user, premium, coach, admin).
     *
     * Les rôles premium sont :
     * - premium
     * - admin
     */
    const canAccessPremium =
        !!user &&
        user.roles
            .map((r) => r.toLowerCase())
            .some((role) => ["premium", "admin"].includes(role));

    return (
        <OceanWavesBackground headerOffsetPx={80} wavesHeight="70vh">
            <div className="mx-auto max-w-5xl pt-6 pb-24">
        <main className="text-brandText flex flex-col">
            <SessionDashboardLayout
                hero={
                    <div className="flex flex-col items-center">
                        {/* Sélecteur des 3 domaines sous le header */}
                        <DomainSwitcher current="meditation" />
                    </div>
                }
                globalErrorMessage={globalErrorMessage}
                leftTop={
                    <SessionCard>
                        <MeditationManualForm
                            types={types}
                            onCreateSessionAction={createSession}
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

                                {/* Bouton d’ouverture du wizard */}
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

                            {/* Bloc animé contenant le wizard */}
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
                                            canAccessPremium={canAccessPremium}
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
            </div>
        </OceanWavesBackground>
    );
}
