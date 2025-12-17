"use client";

import PageHero from "@/components/layout/PageHero";
import { useTranslations } from "@/i18n/TranslationContext";
import { useExerciceSessions } from "@/hooks/useExerciceSessions";
import { ExerciceHistoryCard } from "@/components/exercise/ExerciceHistoryCard";
import ExerciceManualForm from "@/components/exercise/ExerciceManualForm";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import {ExerciceStartSection} from "@/components/exercise/ExerciceStartSection";
import DomainSwitcher from "@/components/shared/DomainSwitcher";
import {WorkoutProgramsStartCard} from "@/components/exercise/ProgramStartCard";
import { usePrograms } from "@/hooks/usePrograms";
import {TodayExercices} from "@/components/exercise/ExerciceDayPlan";
import OceanWavesBackground from "@/components/layout/OceanWavesBackground";

/**
 * Maps error types from the hook to translated messages.
 */
function getErrorMessage(
    t: ReturnType<typeof useTranslations>,
    errorType: "load" | "save" | "types" | null,
): string | null {
    if (errorType === "load") return t("errors_loadHistory");
    if (errorType === "save") return t("errors_saveSession");
    if (errorType === "types") return t("errors_loadTypes");
    return null;
}

export default function ExercicePage() {
    const t = useTranslations("domainExercice");

    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useExerciceSessions();

    const globalErrorMessage = getErrorMessage(t, errorType);

    return (
        <OceanWavesBackground headerOffsetPx={80} wavesHeight="70vh">
            <div className="mx-auto max-w-5xl pt-6 pb-24">
        <main className="text-brandText flex flex-col">
            <SessionDashboardLayout
                hero={
                    <div className="flex flex-col items-center">
                        {/* Sélecteur des 3 domaines sous le hero */}
                        <DomainSwitcher current="exercise" />
                    </div>
                }
                globalErrorMessage={globalErrorMessage}
                leftTop={
                    <>
                        <SessionCard>
                            <TodayExercices/>
                        </SessionCard>
                        <SessionCard>
                            <ExerciceStartSection
                                types={types}
                                onCreateSession={createSession}
                            />
                        </SessionCard>
                    </>

                }

                leftBottom={
                    <>
                        <SessionCard>
                            <ExerciceManualForm
                                types={types}
                                onCreateSessionAction={createSession}/>
                        </SessionCard>
                        <SessionCard>
                            <WorkoutProgramsStartCard />
                        </SessionCard>
                    </>
                }



                rightColumn={
                    <ExerciceHistoryCard
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
