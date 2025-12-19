"use client";

/**
 * @file DomainDetailView.tsx
 * @description
 * Domain detail container view for the World Hub (SPA world-v2).
 *
 * This view:
 * - Renders a header with a back action.
 * - Displays the selected domain title and a shared subtitle.
 * - Delegates domain-specific content rendering to dedicated components.
 * - Remounts the inner content when the hub refresh key changes.
 */

import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "../../hub/WorldHubProvider";
import type { Domain } from "../../hub/types";

import { MeditationDomainDetail } from "./domains/MeditationDomainDetail";
import { SleepDomainDetail } from "./domains/SleepDomainDetail";
import { ExerciseDomainDetail } from "./domains/ExerciseDomainDetail";

/**
 * Props for {@link DomainDetailView}.
 */
export type DomainDetailViewProps = {
    /**
     * Domain identifier.
     */
    domain: Domain;
};

/**
 * Returns the translated title for a given domain.
 *
 * @param domain - Domain identifier.
 * @param t - Translation function for the "world" namespace.
 * @returns Translated domain title.
 */
function getDomainTitle(domain: Domain, t: (key: string) => string): string {
    if (domain === "sleep") return t("domains.sleep");
    if (domain === "meditation") return t("domains.meditation");
    return t("domains.exercise");
}

/**
 * Domain detail view.
 *
 * @param props - Component props.
 * @returns The domain detail container view.
 */
export function DomainDetailView(props: DomainDetailViewProps) {
    const { domain } = props;

    const t = useTranslations("world");
    const { goBack, refreshKey } = useWorldHub();

    const title = useMemo(() => getDomainTitle(domain, t), [domain, t]);

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => goBack()}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("domainDetail.back")}
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-lg font-semibold text-slate-800">{title}</h1>
                    <p className="text-xs text-slate-500">{t("domainDetail.subtitle")}</p>
                </div>
            </header>

            {/* key=refreshKey -> remount when a session is encoded (bumpRefreshKey) */}
            <div key={refreshKey}>
                {domain === "sleep" && <SleepDomainDetail />}
                {domain === "meditation" && <MeditationDomainDetail />}
                {domain === "exercise" && <ExerciseDomainDetail />}
            </div>
        </div>
    );
}
