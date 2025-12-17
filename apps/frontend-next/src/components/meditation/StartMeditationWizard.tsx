"use client";

import { useState } from "react";
import { useMeditationTypes } from "@/hooks/useMeditationTypes";
import {
    useMeditationContents,
    type MeditationContent,
} from "@/hooks/useMeditationContents";
import MoodPicker from "@/components/shared/MoodPicker";
import { MoodValue } from "@/lib";
import { useTranslations } from "@/i18n/TranslationContext";
import { createMeditationSession } from "@/lib/api/meditation";
import WizardAudioPlayer from "./players/WizardAudioPlayer";
import WizardVisualBreathing, {
    type VisualBreathingConfig,
} from "./players/WizardVisualBreathing";
import WizardTimerPlayer from "./players/WizardTimerPlayer";

/**
 * Version étendue de {@link MeditationContent} pour le wizard de démarrage.
 *
 * On y ajoute une éventuelle configuration visuelle (`visualConfig`) pour les
 * méditations de type VISUAL, en conservant la compatibilité avec le typage
 * existant du reste de l’application.
 */
type WizardMeditationContent = MeditationContent & {
    /**
     * Configuration spécifique pour les visualisations de respiration.
     * Peut être `null` ou `undefined` si aucune configuration n’est fournie
     * par le backend.
     */
    visualConfig?: VisualBreathingConfig | null;
};

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

    /**
     * Indique si l’utilisateur connecté a le droit d’accéder
     * aux contenus premium.
     *
     * - `true`  → les contenus premium sont cliquables.
     * - `false` → les contenus premium sont affichés mais grisés et désactivés.
     *
     * La logique de calcul (rôle `premium` / `admin`, etc.) est gérée
     * par le parent (ex. via `useAuthRequired`) et non par ce composant.
     */
    canAccessPremium: boolean;
};

/**
 * Wizard guidant l’utilisateur à travers une séance de méditation.
 *
 * Ce composant orchestre l’ensemble du flux :
 * - choix du type et de la durée,
 * - sélection d’un contenu adapté (avec gestion des contenus premium),
 * - saisie des humeurs avant/après,
 * - phase de pratique (audio, timer ou visuel),
 * - sauvegarde de la séance via l’API.
 *
 * Il ne gère pas directement l’authentification, mais s’appuie sur la prop
 * `canAccessPremium` pour verrouiller ou non les contenus premium.
 *
 * @param onCloseAction Callback appelé pour fermer le wizard.
 * @param canAccessPremium Indique si l’utilisateur peut lancer des contenus premium.
 */
export default function StartMeditationWizard({
                                                  onCloseAction,
                                                  canAccessPremium,
                                              }: StartMeditationWizardProps) {
    const t = useTranslations("domainMeditation");

    /**
     * Étape courante du wizard.
     * Permet de contrôler la section affichée à l’écran.
     */
    const [step, setStep] = useState<Step>("TYPE");

    /**
     * Liste des types de méditation disponibles (ex : respiration, scan corporel, etc.)
     * fournie par le hook métier `useMeditationTypes`.
     */
    const { types, loading: loadingTypes, error: errorTypes } =
        useMeditationTypes();

    /**
     * Identifiant du type de méditation sélectionné.
     * Utilisé pour filtrer les contenus et pour la persistance de la session.
     */
    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(
        undefined,
    );

    /**
     * Durée de la séance exprimée en secondes.
     * Cette valeur est dérivée de la sélection de l’utilisateur (en minutes).
     */
    const [durationSeconds, setDurationSeconds] = useState<
        number | undefined
    >(undefined);

    /**
     * Type actuellement sélectionné, dérivé de `selectedTypeId`.
     * Sert notamment à distinguer certains comportements (ex. type "breathing").
     */
    const selectedType = types.find((t) => t.id === selectedTypeId);

    /**
     * Contenus de méditation filtrés par type et durée.
     * Gérés par le hook métier `useMeditationContents`.
     */
    const {
        contents,
        loading: loadingContents,
        error: errorContents,
    } = useMeditationContents(selectedTypeId, durationSeconds);

    /**
     * Contenu de méditation sélectionné par l’utilisateur.
     * C’est ce contenu qui sera effectivement joué (audio, timer, visuel…).
     */
    const [selectedContent, setSelectedContent] =
        useState<WizardMeditationContent | null>(null);

    /**
     * Humeur de l’utilisateur avant la séance, sélectionnée via `MoodPicker`.
     */
    const [moodBefore, setMoodBefore] = useState<MoodValue | null>(null);

    /**
     * Humeur de l’utilisateur après la séance, sélectionnée via `MoodPicker`.
     */
    const [moodAfter, setMoodAfter] = useState<MoodValue | null>(null);

    /**
     * Indique si une opération de sauvegarde de la séance est en cours.
     * Utilisé pour désactiver le bouton et afficher un état de chargement.
     */
    const [saving, setSaving] = useState(false);

    /**
     * Indique si une erreur s’est produite lors de la sauvegarde de la séance.
     * Permet d’afficher un message d’erreur à l’utilisateur.
     */
    const [saveError, setSaveError] = useState(false);

    /**
     * Durées proposées (en minutes) pour la séance.
     * Ces options sont converties en secondes lors de la sélection.
     */
    const DURATION_OPTIONS_MIN = [5, 10, 15, 20];

    // --- RESET GLOBAL ---

    /**
     * Réinitialise complètement l’état du wizard pour revenir
     * au début du flux (étape TYPE).
     *
     * Cette fonction ne ferme pas le composant ; elle ne fait que
     * remettre tous les états internes à zéro.
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
     * - réinitialise l’état interne,
     * - notifie le parent via `onCloseAction` si fourni.
     *
     * À utiliser lorsque l’utilisateur souhaite abandonner la séance
     * sans rien enregistrer.
     */
    const handleCancelAll = () => {
        resetWizardState();
        onCloseAction?.();
    };

    // --- STEP HANDLERS ---

    /**
     * Sélectionne un type de méditation et passe à l’étape de durée.
     *
     * @param typeId Identifiant du type de méditation choisi.
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
     *
     * Réinitialise également le contenu et les humeurs afin d’éviter
     * des incohérences si la durée change en cours de flux.
     *
     * @param minutes Durée choisie en minutes.
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
     *
     * @param content Contenu de méditation choisi dans la liste filtrée.
     */
    const handleSelectContent = (content: WizardMeditationContent) => {
        setSelectedContent(content);
        setMoodBefore(null);
        setMoodAfter(null);
        setStep("MOOD_BEFORE");
    };

    /**
     * Démarre la séance de méditation : passe à l’étape PLAYING.
     *
     * Ne fait rien si les prérequis (type, contenu, durée) ne sont pas définis,
     * afin d’éviter un état incohérent du wizard.
     */
    const handleStartSession = () => {
        if (!selectedContent || !selectedTypeId || !durationSeconds) return;
        setStep("PLAYING");
    };

    /**
     * Indique la fin de la séance (via player ou bouton) :
     * passe à l’étape "humeur après".
     */
    const handleEndSession = () => {
        setStep("MOOD_AFTER");
    };

    /**
     * Sauvegarde la séance de méditation en appelant l’API.
     *
     * Les humeurs sont facultatives : si elles ne sont pas renseignées,
     * elles ne sont pas envoyées (undefined).
     *
     * En cas de succès, le wizard passe à l’étape `DONE`.
     * En cas d’erreur, un message informatif est affiché.
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
     * Ferme le wizard à la fin du flux.
     *
     * Cette fonction ne réinitialise pas l’état interne ; elle se contente
     * de signaler au parent que le wizard peut être masqué.
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
                                    {contents.map((c) => {
                                        /**
                                         * Contenu premium verrouillé si l’utilisateur
                                         * n’a pas les droits (`canAccessPremium = false`).
                                         */
                                        const isPremiumLocked = c.isPremium && !canAccessPremium;

                                        return (
                                            <li key={c.id}>
                                                <button
                                                    type="button"
                                                    disabled={isPremiumLocked}
                                                    onClick={() => {
                                                        if (isPremiumLocked) return;
                                                        handleSelectContent(c as WizardMeditationContent);
                                                    }}
                                                    className={
                                                        "flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left shadow-sm transition " +
                                                        (isPremiumLocked
                                                            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                                                            : "border-slate-200 hover:border-indigo-400 hover:shadow-md")
                                                    }
                                                >
                                                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        {c.title}
                      </span>

                                                        <div className="flex items-center gap-2">
                                                            {/* Icône du mode */}
                                                            {c.mode === "TIMER" && (
                                                                <img
                                                                    src="/images/meditation_mode_timer.png"
                                                                    alt="timer"
                                                                    className="h-6 w-6 opacity-80"
                                                                />
                                                            )}
                                                            {c.mode === "AUDIO" && (
                                                                <img
                                                                    src="/images/meditation_mode_audio.png"
                                                                    alt="audio"
                                                                    className="h-6 w-6 opacity-80"
                                                                />
                                                            )}
                                                            {c.mode === "VISUAL" && (
                                                                <img
                                                                    src="/images/meditation_mode_visual.png"
                                                                    alt="visual"
                                                                    className="h-6 w-6 opacity-80"
                                                                />
                                                            )}
                                                            {c.mode === "VIDEO" && (
                                                                <img
                                                                    src="/images/meditation_mode_video.png"
                                                                    alt="video"
                                                                    className="h-6 w-6 opacity-80"
                                                                />
                                                            )}

                                                            {/* Icône Premium */}
                                                            {c.isPremium && (
                                                                <img
                                                                    src="/images/session_premium.png"
                                                                    alt="premium"
                                                                    className="h-6 w-6"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {c.description && (
                                                        <p className="text-sm text-slate-500">
                                                            {c.description}
                                                        </p>
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
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

                    {/* TIMER */}
                    {selectedContent.mode === "TIMER" &&
                        (() => {
                            const effectiveSeconds =
                                durationSeconds ??
                                selectedContent.defaultDurationSeconds ??
                                0;

                            if (effectiveSeconds <= 0) {
                                return (
                                    <p className="text-sm text-slate-500">
                                        {t(
                                            "wizard_stepPlaying_placeholder",
                                        )}
                                    </p>
                                );
                            }

                            return (
                                <WizardTimerPlayer
                                    title={selectedContent.title}
                                    totalSeconds={effectiveSeconds}
                                    onEnd={handleEndSession}
                                />
                            );
                        })()}

                    {/* VISUAL – pour l’instant seulement pour le type "breathing" */}
                    {selectedContent.mode === "VISUAL" &&
                        selectedType?.slug === "breathing" && (
                            <WizardVisualBreathing
                                title={selectedContent.title}
                                config={
                                    selectedContent.visualConfig ?? undefined
                                }
                                onEnd={handleEndSession}
                            />
                        )}

                    {/* VISUAL – placeholder pour les autres types */}
                    {selectedContent.mode === "VISUAL" &&
                        selectedType?.slug !== "breathing" && (
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
