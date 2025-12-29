import Image from "next/image";
import type { MoodValue } from "@/lib";
import MoodPicker from "@/components/shared/MoodPicker";
import WizardAudioPlayer from "./players/WizardAudioPlayer";
import WizardTimerPlayer from "./players/WizardTimerPlayer";
import WizardVisualBreathing from "./players/WizardVisualBreathing";

import type { WizardMeditationContent } from "./startMeditationWizard.config";
import {
    DURATION_OPTIONS_MIN,
    MEDITATION_MODE_ICON_SRC,
    isPremiumContentLocked
} from "./startMeditationWizard.config";

type TFn = (k: string) => string;

export function StepType({
                             t,
                             types,
                             onSelectType,
                         }: {
    t: TFn;
    types: Array<{ id: string; slug: string }>;
    onSelectType: (typeId: string) => void;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("wizard_stepType_title")}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {types.map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onSelectType(type.id)}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                    >
                        <div className="font-medium">{t(`meditationTypes.${type.slug}.name`)}</div>
                        <p className="text-sm text-slate-500">{t(`meditationTypes.${type.slug}.description`)}</p>
                    </button>
                ))}
            </div>
        </section>
    );
}

export function StepDuration({
                                 t,
                                 onSelectDurationMin,
                                 onBackToType,
                             }: {
    t: TFn;
    onSelectDurationMin: (minutes: number) => void;
    onBackToType: () => void;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("wizard_stepDuration_title")}</h2>

            <div className="flex flex-wrap gap-3">
                {DURATION_OPTIONS_MIN.map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onSelectDurationMin(m)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                    >
                        {m} {t("wizard_minutes")}
                    </button>
                ))}
            </div>

            <button type="button" className="text-sm text-slate-500 underline" onClick={onBackToType}>
                {t("wizard_backToType")}
            </button>
        </section>
    );
}

export function StepContent({
                                t,
                                contents,
                                loading,
                                error,
                                canAccessPremium,
                                onSelectContent,
                                onBackToDuration,
                            }: {
    t: TFn;
    contents: WizardMeditationContent[];
    loading: boolean;
    error: boolean;
    canAccessPremium: boolean;
    onSelectContent: (content: WizardMeditationContent) => void;
    onBackToDuration: () => void;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("wizard_stepContent_title")}</h2>

            {loading && <div>{t("wizard_loadingContents")}</div>}
            {error && <div>{t("wizard_errorContents")}</div>}

            {!loading && !error && (
                <>
                    {contents.length === 0 ? (
                        <p className="text-sm text-slate-500">{t("wizard_stepContent_empty")}</p>
                    ) : (
                        <ul className="space-y-3">
                            {contents.map((c) => {
                                const isLocked = isPremiumContentLocked(c, canAccessPremium);
                                const modeIcon = MEDITATION_MODE_ICON_SRC[c.mode];

                                return (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            disabled={isLocked}
                                            onClick={() => {
                                                if (isLocked) return;
                                                onSelectContent(c);
                                            }}
                                            className={
                                                "flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left shadow-sm transition " +
                                                (isLocked
                                                    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                                                    : "border-slate-200 hover:border-indigo-400 hover:shadow-md")
                                            }
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <span className="font-medium flex items-center gap-2">{c.title}</span>

                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={modeIcon.src}
                                                        alt={modeIcon.alt}
                                                        width={24}
                                                        height={24}
                                                        className="h-6 w-6 opacity-80"
                                                    />
                                                    {c.isPremium && (
                                                        <Image
                                                            src="/images/session_premium.png"
                                                            alt="premium"
                                                            width={24}
                                                            height={24}
                                                            className="h-6 w-6"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {c.description && <p className="text-sm text-slate-500">{c.description}</p>}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}

            <button type="button" className="text-sm text-slate-500 underline" onClick={onBackToDuration}>
                {t("wizard_backToDuration")}
            </button>
        </section>
    );
}

export function StepMood({
                             t,
                             titleKey,
                             value,
                             onChange,
                             primaryLabel,
                             onPrimary,
                             secondaryLabel,
                             onSecondary,
                             saving,
                             primaryDisabled,
                         }: {
    t: TFn;
    titleKey: string;
    value: MoodValue | null;
    onChange: (v: MoodValue | null) => void;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel: string;
    onSecondary: () => void;
    saving?: boolean;
    primaryDisabled?: boolean;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t(titleKey)}</h2>
            <MoodPicker value={value} onChangeAction={onChange} variant="row" size="sm" tone="minimal" />
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onSecondary}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                >
                    {secondaryLabel}
                </button>

                <button
                    type="button"
                    onClick={onPrimary}
                    disabled={Boolean(saving) || Boolean(primaryDisabled)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                >
                    {primaryLabel}
                </button>
            </div>
        </section>
    );
}

export function StepPlaying({
                                t,
                                selectedContent,
                                selectedTypeSlug,
                                durationSeconds,
                                onEndSession,
                                onCancelAll,
                            }: {
    t: TFn;
    selectedContent: WizardMeditationContent;
    selectedTypeSlug: string | undefined;
    durationSeconds: number | undefined;
    onEndSession: () => void;
    onCancelAll: () => void;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">
                {t("wizard_stepPlaying_title")} {selectedContent.title}
            </h2>

            {selectedContent.mode === "AUDIO" && selectedContent.mediaUrl && (
                <WizardAudioPlayer
                    title={selectedContent.title}
                    mediaUrl={selectedContent.mediaUrl}
                    onEnd={onEndSession}
                />
            )}

            {selectedContent.mode === "TIMER" &&
                (() => {
                    const effectiveSeconds = durationSeconds ?? selectedContent.defaultDurationSeconds ?? 0;

                    if (effectiveSeconds <= 0) {
                        return <p className="text-sm text-slate-500">{t("wizard_stepPlaying_placeholder")}</p>;
                    }

                    return (
                        <WizardTimerPlayer
                            title={selectedContent.title}
                            totalSeconds={effectiveSeconds}
                            onEnd={onEndSession}
                        />
                    );
                })()}

            {selectedContent.mode === "VISUAL" && selectedTypeSlug === "breathing" && (
                <WizardVisualBreathing
                    title={selectedContent.title}
                    config={selectedContent.visualConfig ?? undefined}
                    onEnd={onEndSession}
                />
            )}

            {selectedContent.mode === "VISUAL" && selectedTypeSlug !== "breathing" && (
                <p className="text-sm text-slate-500">{t("wizard_stepPlaying_placeholder")}</p>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onEndSession}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
                >
                    {t("wizard_endSession")}
                </button>
                <button
                    type="button"
                    onClick={onCancelAll}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
                >
                    {t("wizard_cancel")}
                </button>
            </div>
        </section>
    );
}

export function StepDone({
                             t,
                             onClose,
                         }: {
    t: TFn;
    onClose: () => void;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t("wizard_stepDone_title")}</h2>
            <p className="text-sm text-slate-500">{t("wizard_stepDone_description")}</p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
                >
                    {t("wizard_close")}
                </button>
            </div>
        </section>
    );
}
