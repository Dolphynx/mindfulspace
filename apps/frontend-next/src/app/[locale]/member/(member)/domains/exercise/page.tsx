"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import { useExerciseSessions } from "@/hooks/useExerciseSessions";
import { ExerciseHistoryCard } from "@/components/exercise/ExerciseHistoryCard";
import ExerciseManualForm from "@/components/exercise/ExerciseManualForm";
import { SessionDashboardLayout } from "@/components/session/SessionDashboardLayout";
import { SessionCard } from "@/components/session/SessionCard";
import {ExerciseStartSection} from "@/components/exercise/ExerciseStartSection";
import DomainSwitcher from "@/components/shared/DomainSwitcher";
import {WorkoutProgramsStartCard} from "@/components/exercise/ProgramStartCard";
import {TodayExercises} from "@/components/exercise/ExerciseDayPlan";
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

export default function ExercisePage() {
    const t = useTranslations("domainExercise");

    const {
        sessions,
        types,
        loading,
        errorType,
        createSession,
    } = useExerciseSessions();

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
                            <TodayExercises/>
                        </SessionCard>
                        <SessionCard>
                            <ExerciseStartSection
                                types={types}
                                onCreateSession={createSession}
                            />
                        </SessionCard>
                    </>

                }

                leftBottom={
                    <>
                        <SessionCard>
                            <ExerciseManualForm
                                types={types}
                                onCreateSessionAction={createSession}/>
                        </SessionCard>
                        <SessionCard>
                            <WorkoutProgramsStartCard />
                        </SessionCard>
                    </>
                }



                rightColumn={
                    <ExerciseHistoryCard
                        sessions={sessions}
                        loading={loading}
                        errorType={errorType}
                    />
                }

            />
        </main>
            </div>
        </OceanWavesBackground>
    );
}
