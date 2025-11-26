"use client";

import { useState } from "react";
import { useMeditationTypes } from "@/hooks/useMeditationTypes";
import {
    useMeditationContents,
    type MeditationContent,
} from "@/hooks/useMeditationContents";
import MoodPicker from "@/components/MoodPicker";
import { MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";
import { createMeditationSession } from "@/lib/api/meditation";
import WizardAudioPlayer from "./players/WizardAudioPlayer";

/**
 * Étapes successives du wizard de démarrage de méditation.
 *
 * - `TYPE` : choix du type de méditation
 * - `DURATION` : choix de la durée
 * - `CONTENT` : sélection d’un contenu concret (audio, visuel, etc.)
 * - `MOOD_BEFORE` : saisie de l’humeur avant la séance
 * - `PLAYING` : phase de pratique (lecture audio, timer, visuel…)
 * - `MOOD_AFTER` : saisie de l’humeur après la séance
 * - `DONE` : confirmation de sauvegarde et écran final
 */
type Step =
    | "TYPE"
    | "DURATION"
    | "CONTENT"
    | "MOOD_BEFORE"
    | "PLAYING"
    | "MOOD_AFTER"
    | "DONE";

/**
 * Propriétés du composant `StartMeditationWizard`.
 */
type StartMeditationWizardProps = {
    /**
     * Callback optionnel appelé lorsqu’on ferme le wizard
     * (par exemple après annulation ou après la fin du flux).
     */
    onCloseAction?: () => void;
};

/**
 * Wizard guidant l’utilisateur à travers une séance de méditation :
 *
 * 1. Choix du type de méditation
 * 2. Choix de la durée
 * 3. Sélection d’un contenu
 * 4. Humeur avant
 * 5. Lecture / pratique
 * 6. Humeur après
 * 7. Sauvegarde et écran de fin
 *
 * Le composant orchestre :
 * - la navigation entre les étapes
 * - le chargement des types et contenus de méditation via les hooks dédiés
 * - la collecte des données nécessaires pour créer une séance
 * - l’appel à l’API pour la sauvegarde
 *
 * @param props Voir {@link StartMeditationWizardProps}.
 * @returns JSX du wizard de démarrage de méditation.
 */
export default function StartMeditationWizard({
                                                  onCloseAction,
                                              }: StartMeditationWizardProps) {
    const t = useTranslations("domainMeditation");

    const [step, setStep] = useState<Step>("TYPE");

    // Types de méditation disponibles (ex : respiration, scan corporel, etc.)
    const { types, loading: loadingTypes, error: errorTypes } =
        useMeditationTypes();

    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(
        undefined,
    );
    const [durationSeconds, setDurationSeconds] = useState<
        number | undefined
    >(undefined);

    // Contenus filtrés par type + durée souhaitée
    const {
        contents,
        loading: loadingContents,
        error: errorContents,
    } = useMeditationContents(selectedTypeId, durationSeconds);

    const [selectedContent, setSelectedContent] =
        useState<MeditationContent | null>(null);
    const [moodBefore, setMoodBefore] = useState<MoodValue | null>(null);
    const [moodAfter, setMoodAfter] = useState<MoodValue | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(false);

    // Durées proposées (en minutes) pour la séance
    const DURATION_OPTIONS_MIN = [5, 10, 15, 20];

    // --- RESET GLOBAL ---

    /**
     * Réinitialise complètement l’état du wizard pour revenir
     * au début du flux (étape TYPE).
     */
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

    /**
     * Gère l’annulation globale :
     * - réinitialise l’état interne
     * - notifie le parent via `onCloseAction` si fourni
     */
    const handleCancelAll = () => {
        resetWizardState();
        onCloseAction?.();
    };

    // --- STEP HANDLERS ---

    /**
     * Sélectionne un type de méditation et passe à l’étape de durée.
     */
    const handleSelectType = (typeId: string) => {
        setSelectedTypeId(typeId);
        setDurationSeconds(undefined);
        setSelectedContent(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("DURATION");
    };

    /**
     * Sélectionne une durée (en minutes) et passe à l’étape de contenu.
     */
    const handleSelectDuration = (minutes: number) => {
        setDurationSeconds(minutes * 60);
        setSelectedContent(null);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("CONTENT");
    };

    /**
     * Sélectionne un contenu de méditation et passe à l’étape "humeur avant".
     */
    const handleSelectContent = (content: MeditationContent) => {
        setSelectedContent(content);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("MOOD_BEFORE");
    };

    /**
     * Démarre la séance de méditation :
     * vérifie qu’un type, une durée et un contenu sont définis
     * puis passe à l’étape PLAYING.
     */
    const handleStartSession = () => {
        if (!selectedContent || !selectedTypeId || !durationSeconds) return;
        setStep("PLAYING");
    };

    /**
     * Indique la fin de la séance (soit via le player, soit via l’utilisateur)
     * et passe à l’étape "humeur après".
     */
    const handleEndSession = () => {
        setStep("MOOD_AFTER");
    };

    /**
     * Sauvegarde la séance de méditation en appelant l’API.
     *
     * Enregistre :
     * - type de méditation
     * - contenu choisi
     * - durée réelle de la séance
     * - date/heure de la séance (now)
     * - humeur avant et après (si renseignées)
     *
     * En cas d’erreur, un message est affiché à l’utilisateur.
     */
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

            setStep("DONE");
        } catch (e) {
            console.error("Failed to save meditation session", e);
            setSaveError(true);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Ferme le wizard sans réinitialiser explicitement l’état.
     * Utilisé à la fin du flux (étape DONE).
     */
    const handleClose = () => {
        onCloseAction?.();
    };

    // --- RENDER ---

    if (loadingTypes) {
        return <div>{t("wizard_loadingTypes")}</div>;
    }

    if (errorTypes) {
        return <div>{t("wizard_errorTypes")}</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* TYPE */}
            {step === "TYPE" && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepType_title")}
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => handleSelectType(type.id)}
                                className="rounded-xl border border-slate-200 px-4 py-3 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                            >
                                <div className="font-medium">
                                    {t(
                                        `meditationTypes.${type.slug}.name`,
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">
                                    {t(
                                        `meditationTypes.${type.slug}.description`,
                                    )}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* DURÉE */}
            {step === "DURATION" && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepDuration_title")}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {DURATION_OPTIONS_MIN.map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => handleSelectDuration(m)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                            >
                                {m} {t("wizard_minutes")}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="text-sm text-slate-500 underline"
                        onClick={() => setStep("TYPE")}
                    >
                        {t("wizard_backToType")}
                    </button>
                </section>
            )}

            {/* CONTENU */}
            {step === "CONTENT" && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepContent_title")}
                    </h2>

                    {loadingContents && (
                        <div>{t("wizard_loadingContents")}</div>
                    )}
                    {errorContents && (
                        <div>{t("wizard_errorContents")}</div>
                    )}

                    {!loadingContents && !errorContents && (
                        <>
                            {contents.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    {t("wizard_stepContent_empty")}
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {contents.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectContent(c)
                                                }
                                                className="flex w-full flex-col items-start gap-1 rounded-xl border border-slate-200 px-4 py-3 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="font-medium">
                                                        {c.title}
                                                    </span>
                                                    {c.isPremium && (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                            {t(
                                                                "wizard_premium",
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {c.description && (
                                                    <p className="text-sm text-slate-500">
                                                        {c.description}
                                                    </p>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    <button
                        type="button"
                        className="text-sm text-slate-500 underline"
                        onClick={() => setStep("DURATION")}
                    >
                        {t("wizard_backToDuration")}
                    </button>
                </section>
            )}

            {/* MOOD AVANT */}
            {step === "MOOD_BEFORE" && selectedContent && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepMoodBefore_title")}
                    </h2>
                    <MoodPicker
                        value={moodBefore}
                        onChangeAction={setMoodBefore}
                        variant="row"
                        size="sm"
                        tone="minimal"
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep("CONTENT")}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                        >
                            {t("wizard_backToContent")}
                        </button>
                        <button
                            type="button"
                            onClick={handleStartSession}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
                        >
                            {t("wizard_startSession")}
                        </button>
                    </div>
                </section>
            )}

            {/* PLAYER */}
            {step === "PLAYING" && selectedContent && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepPlaying_title")}{" "}
                        {selectedContent.title}
                    </h2>

                    {/* AUDIO */}
                    {selectedContent.mode === "AUDIO" &&
                        selectedContent.mediaUrl && (
                            <WizardAudioPlayer
                                title={selectedContent.title}
                                mediaUrl={selectedContent.mediaUrl}
                                onEnd={handleEndSession}
                            />
                        )}

                    {/* TIMER / VISUAL placeholders pour la suite */}
                    {selectedContent.mode === "TIMER" && (
                        <p className="text-sm text-slate-500">
                            {t("wizard_stepPlaying_placeholder")}
                        </p>
                    )}
                    {selectedContent.mode === "VISUAL" && (
                        <p className="text-sm text-slate-500">
                            {t("wizard_stepPlaying_placeholder")}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleEndSession}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
                        >
                            {t("wizard_endSession")}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelAll}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                        >
                            {t("wizard_cancel")}
                        </button>
                    </div>
                </section>
            )}

            {/* MOOD APRÈS */}
            {step === "MOOD_AFTER" && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepMoodAfter_title")}
                    </h2>
                    <MoodPicker
                        value={moodAfter}
                        onChangeAction={setMoodAfter}
                        variant="row"
                        size="sm"
                        tone="minimal"
                    />

                    {saveError && (
                        <p className="text-sm text-red-600">
                            {t("wizard_saveError")}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSaveSession}
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {saving
                                ? t("wizard_saving")
                                : t("wizard_save")}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelAll}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                        >
                            {t("wizard_cancel")}
                        </button>
                    </div>
                </section>
            )}

            {/* DONE */}
            {step === "DONE" && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        {t("wizard_stepDone_title")}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {t("wizard_stepDone_description")}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                resetWizardState();
                                handleClose();
                            }}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
                        >
                            {t("wizard_close")}
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
