"use client";

/**
 * @file DomainDetailView.tsx
 * @description
 * Conteneur de détail de domaine pour le World Hub (SPA world-v2).
 *
 * Responsabilités :
 * - Afficher un en-tête avec action de retour (navigation interne du hub).
 * - Afficher le titre du domaine sélectionné et un sous-titre commun.
 * - Déléguer le rendu du contenu métier à un composant dédié par domaine.
 * - Forcer le remontage (remount) du contenu interne lorsque `refreshKey` change,
 *   afin de réinitialiser les états locaux et relancer les hooks de chargement.
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
 * Propriétés du composant {@link DomainDetailView}.
 */
export type DomainDetailViewProps = {
    /**
     * Identifiant du domaine à afficher.
     */
    domain: Domain;
};

/**
 * Résout le titre traduit d’un domaine.
 *
 * Les clés de traduction appartiennent au namespace `world` (ex. `world.domains.sleep`).
 *
 * @param domain - Identifiant du domaine.
 * @param t - Fonction de traduction associée au namespace `world`.
 * @returns Titre traduit du domaine.
 */
function getDomainTitle(domain: Domain, t: (key: string) => string): string {
    if (domain === "sleep") return t("domains.sleep");
    if (domain === "meditation") return t("domains.meditation");
    return t("domains.exercise");
}

/**
 * Vue de détail d’un domaine (conteneur).
 *
 * Fonctionnement :
 * - Le titre est dérivé via `getDomainTitle` et mémoïsé.
 * - Le bouton “retour” déclenche `goBack()` (pile de navigation interne du hub).
 * - Le contenu métier est rendu conditionnellement selon `domain`.
 * - Le wrapper interne utilise `key={refreshKey}` pour forcer un remount
 *   lorsque le hub signale un rafraîchissement global.
 *
 * @param props - Propriétés du composant.
 * @returns Vue conteneur affichant le détail du domaine sélectionné.
 */
export function DomainDetailView(props: DomainDetailViewProps) {
    const { domain } = props;

    const t = useTranslations("world");
    const { goBack, refreshKey } = useWorldHub();

    /**
     * Titre traduit du domaine, recalculé uniquement lorsque `domain` ou `t` change.
     */
    const title = useMemo(() => getDomainTitle(domain, t), [domain, t]);

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-3">
                {/*<button
                    type="button"
                    onClick={() => goBack()}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("domainDetail.back")}
                </button>*/}

                <div className="min-w-0">
                    <h1 className="truncate text-lg font-semibold text-slate-800">{title}</h1>
                    <p className="text-xs text-slate-500">{t("domainDetail.subtitle")}</p>
                </div>
            </header>

            {/* key=refreshKey : force un remount lors d’un rafraîchissement global (bumpRefreshKey) */}
            <div key={refreshKey}>
                {domain === "sleep" && <SleepDomainDetail />}
                {domain === "meditation" && <MeditationDomainDetail />}
                {domain === "exercise" && <ExerciseDomainDetail />}
            </div>
        </div>
    );
}
