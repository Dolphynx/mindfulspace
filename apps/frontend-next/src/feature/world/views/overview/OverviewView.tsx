"use client";

/**
 * @file OverviewView.tsx
 * @description
 * Vue principale du dashboard du World Hub (SPA world-v2).
 *
 * Cette vue orchestre l’ensemble de l’overview et constitue le point d’entrée
 * fonctionnel du panneau “overview”.
 *
 * Objectifs UI :
 * - Présenter une synthèse transverse multi-domaines basée sur des métriques réelles.
 * - Mettre en avant les actions du jour.
 * - Afficher les badges récents de manière persistante.
 * - Donner accès aux vues de détail des domaines (sleep, meditation, exercise).
 */

import { useTranslations } from "@/i18n/TranslationContext";
import { useWorldHub } from "../../hub/WorldHubProvider";
import type { Domain } from "../../hub/types";

import { useWorldOverview } from "@/feature/world/hooks/useWorldOverview";
import { TopSummarySection } from "@/feature/world/views/overview/sections/TopSummarySection";
import { TodaySection } from "@/feature/world/views/overview/sections/TodaySection";
import { DomainsSection } from "@/feature/world/views/overview/sections/DomainsSection";

/**
 * Vue dashboard principale du World Hub.
 *
 * Responsabilités :
 * - Initialiser le chargement des métriques globales via `useWorldOverview`.
 * - Dériver les états `isLoading` et `hasData` à partir du state du hook.
 * - Connecter les sections de l’overview aux actions de navigation du World Hub.
 *
 * Cette vue ne contient aucune logique métier de calcul :
 * - les données proviennent du hook d’overview,
 * - les actions de navigation sont déléguées au `WorldHubProvider`.
 *
 * @returns Composant React client représentant l’overview du World Hub.
 */
export function OverviewView() {
    const t = useTranslations("world");

    const {
        openBadges,
        openQuickLog,
        openStartSession,
        openPrograms,
        openDomainDetail,
    } = useWorldHub();

    /**
     * Chargement des métriques agrégées de l’overview.
     */
    const overview = useWorldOverview();

    /**
     * État dérivé : chargement en cours.
     *
     * - `idle` : hook initialisé mais requête pas encore résolue.
     * - `loading` : requête en cours.
     */
    const isLoading = overview.status === "idle" || overview.status === "loading";

    /**
     * État dérivé : données disponibles avec succès.
     */
    const hasData = overview.status === "success";

    /**
     * Ouvre la vue de détail d’un domaine.
     *
     * Cette fonction est passée aux sous-sections afin de conserver
     * un point d’entrée unique vers la navigation du World Hub.
     *
     * @param domain - Identifiant du domaine (sleep, meditation, exercise).
     */
    function handleOpenDomainDetail(domain: Domain) {
        openDomainDetail(domain);
    }

    return (
        <div className="space-y-6">
            <TopSummarySection
                t={t}
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
                onOpenBadges={() => openBadges()}
            />

            <TodaySection
                t={t}
                onOpenQuickLog={() => openQuickLog()}
                onOpenStartSession={() => openStartSession()}
                onOpenPrograms={() => openPrograms()}
            />

            <DomainsSection
                t={t}
                overview={overview}
                isLoading={isLoading}
                hasData={hasData}
                onOpenDomainDetail={handleOpenDomainDetail}
                onOpenQuickLog={(domain?: Domain) => openQuickLog(domain)}
            />
        </div>
    );
}
