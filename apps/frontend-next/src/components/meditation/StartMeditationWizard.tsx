"use client";

import { useState } from "react";
import { useMeditationTypes } from "@/hooks/useMeditationTypes";
import { useMeditationContents } from "@/hooks/useMeditationContents";
import { MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";
import { createMeditationSession } from "@/lib/api/meditation";

import type { Step, WizardMeditationContent } from "./startMeditationWizard.config";

import {
    StepType,
    StepDuration,
    StepContent,
    StepMood,
    StepPlaying,
    StepDone,
} from "./StartMeditationWizard.steps";

type StartMeditationWizardProps = {
    onCloseAction?: () => void;
    onSessionSavedAction?: () => void;
    canAccessPremium: boolean;
};

export default function StartMeditationWizard({
                                                  onCloseAction,
                                                  onSessionSavedAction,
                                                  canAccessPremium,
                                              }: StartMeditationWizardProps) {
    const t = useTranslations("domainMeditation");

    const [step, setStep] = useState<Step>("TYPE");
    const { types, loading: loadingTypes, error: errorTypes } = useMeditationTypes();

    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);
    const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);

    const selectedType = types.find((x) => x.id === selectedTypeId);

    const { contents, loading: loadingContents, error: errorContents } =
        useMeditationContents(selectedTypeId, durationSeconds);

    const [selectedContent, setSelectedContent] = useState<WizardMeditationContent | null>(null);

    const [moodBefore, setMoodBefore] = useState<MoodValue | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodValue | null>(null);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(false);

    // --- RESET GLOBAL ---

    const resetWizardState = () => {
        setStep("TYPE");
        setSelectedTypeId(undefined);
        setDurationSeconds(undefined);
        setSelectedContent(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setSaving(false);
        setSaveError(false);
    };

    const handleCancelAll = () => {
        resetWizardState();
        onCloseAction?.();
    };

    // --- STEP HANDLERS ---

    const handleSelectType = (typeId: string) => {
        setSelectedTypeId(typeId);
        setDurationSeconds(undefined);
        setSelectedContent(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("DURATION");
    };

    const handleSelectDuration = (minutes: number) => {
        setDurationSeconds(minutes * 60);
        setSelectedContent(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("CONTENT");
    };

    const handleSelectContent = (content: WizardMeditationContent) => {
        setSelectedContent(content);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("MOOD_BEFORE");
    };

    const handleStartSession = () => {
        if (!selectedContent || !selectedTypeId || !durationSeconds) return;
        setStep("PLAYING");
    };

    const handleEndSession = () => {
        setStep("MOOD_AFTER");
    };

    const handleSaveSession = async () => {
        if (!selectedContent || !selectedTypeId || !durationSeconds) return;

        try {
            setSaving(true);
            setSaveError(false);

            await createMeditationSession({
                meditationTypeId: selectedTypeId,
                meditationContentId: selectedContent.id,
                durationSeconds,
                dateSession: new Date().toISOString(),
                moodBefore: moodBefore ?? undefined,
                moodAfter: moodAfter ?? undefined,
            });

            onSessionSavedAction?.();
            setStep("DONE");
        } catch (e) {
            console.error("Failed to save meditation session", e);
            setSaveError(true);
        } finally {
            setSaving(false);
        }
    };

    // --- RENDER ---

    if (loadingTypes) return <div>{t("wizard_loadingTypes")}</div>;
    if (errorTypes) return <div>{t("wizard_errorTypes")}</div>;

    return (
        <div className="flex flex-col gap-6">
            {step === "TYPE" && (
                <StepType t={t} types={types} onSelectType={handleSelectType} />
            )}

            {step === "DURATION" && (
                <StepDuration
                    t={t}
                    onSelectDurationMin={handleSelectDuration}
                    onBackToType={() => setStep("TYPE")}
                />
            )}

            {step === "CONTENT" && (
                <StepContent
                    t={t}
                    contents={contents as WizardMeditationContent[]}
                    loading={loadingContents}
                    error={Boolean(errorContents)}
                    canAccessPremium={canAccessPremium}
                    onSelectContent={handleSelectContent}
                    onBackToDuration={() => setStep("DURATION")}
                />
            )}

            {step === "MOOD_BEFORE" && selectedContent && (
                <StepMood
                    t={t}
                    titleKey="wizard_stepMoodBefore_title"
                    value={moodBefore}
                    onChange={setMoodBefore}
                    secondaryLabel={t("wizard_backToContent")}
                    onSecondary={() => setStep("CONTENT")}
                    primaryLabel={t("wizard_startSession")}
                    onPrimary={handleStartSession}
                />
            )}

            {step === "PLAYING" && selectedContent && (
                <StepPlaying
                    t={t}
                    selectedContent={selectedContent}
                    selectedTypeSlug={selectedType?.slug}
                    durationSeconds={durationSeconds}
                    onEndSession={handleEndSession}
                    onCancelAll={handleCancelAll}
                />
            )}

            {step === "MOOD_AFTER" && (
                <>
                    <StepMood
                        t={t}
                        titleKey="wizard_stepMoodAfter_title"
                        value={moodAfter}
                        onChange={setMoodAfter}
                        secondaryLabel={t("wizard_cancel")}
                        onSecondary={handleCancelAll}
                        primaryLabel={saving ? t("wizard_saving") : t("wizard_save")}
                        onPrimary={handleSaveSession}
                        saving={saving}
                    />
                    {saveError && <p className="text-sm text-red-600">{t("wizard_saveError")}</p>}
                </>
            )}

            {step === "DONE" && (
                <StepDone
                    t={t}
                    onClose={() => {
                        resetWizardState();
                        onCloseAction?.();
                    }}
                />
            )}
        </div>
    );
}
