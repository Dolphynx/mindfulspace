"use client";

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "../hub/WorldHubProvider";

export function PanelHeader() {
    const t = useTranslations("world");
    const { currentView, canGoBack, goBack, closePanel } = useWorldHub();

    const title = (() => {
        switch (currentView.type) {
            case "overview":
                return t("panel.titles.overview");
            case "badges":
                return t("panel.titles.badges");
            case "quickLog":
                return t("panel.titles.quickLog");
            case "startSession":
                return t("panel.titles.startSession");
            default:
                return t("panel.titles.overview");
        }
    })();

    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/30">
            <div className="flex items-center gap-3">
                {canGoBack ? (
                    <button
                        type="button"
                        onClick={goBack}
                        className="h-9 w-9 rounded-2xl bg-white/50 hover:bg-white/70 transition flex items-center justify-center"
                        aria-label={t("panel.backAria")}
                    >
                        ←
                    </button>
                ) : (
                    <div className="h-9 w-9" />
                )}

                <div className="text-sm font-semibold tracking-wide text-slate-700">
                    {title}
                </div>
            </div>

            <button
                type="button"
                onClick={closePanel}
                className="h-10 w-10 rounded-2xl bg-white/50 hover:bg-white/70 transition flex items-center justify-center"
                aria-label={t("panel.closeAria")}
            >
                ✕
            </button>
        </div>
    );
}
