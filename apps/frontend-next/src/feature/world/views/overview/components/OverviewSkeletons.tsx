"use client";

/**
 * @file OverviewSkeletons.tsx
 * @description
 * Composants de skeleton utilisés par la vue d’overview du World Hub
 * pendant les phases de chargement des données.
 *
 * Ces composants :
 * - occupent l’espace final attendu par les vraies cartes,
 * - évitent les sauts de layout (layout shift),
 * - conservent une cohérence visuelle avec les composants définitifs.
 */

/**
 * Skeleton de chargement pour la zone “snapshot”.
 *
 * Structure simulée :
 * - Un titre court.
 * - Une ligne de chips (statistiques).
 * - Un bloc principal représentant le contenu détaillé.
 *
 * @returns Panneau skeleton pour la zone snapshot.
 */
export function SkeletonPanel() {
    return (
        <div className="rounded-2xl bg-white/60 border border-white/40 p-4">
            {/* Titre */}
            <div className="h-4 w-24 rounded bg-white/70" />

            {/* Chips statistiques */}
            <div className="mt-3 flex gap-2">
                <div className="h-6 w-28 rounded-full bg-white/70" />
                <div className="h-6 w-28 rounded-full bg-white/70" />
                <div className="h-6 w-20 rounded-full bg-white/70" />
            </div>

            {/* Contenu principal */}
            <div className="mt-4 h-12 rounded-2xl bg-white/60 border border-white/40" />
        </div>
    );
}

/**
 * Skeleton de chargement pour une carte de domaine.
 *
 * Structure simulée :
 * - Un titre.
 * - Un sous-titre.
 * - Deux blocs KPI.
 * - Un bouton ou bloc d’action en bas.
 *
 * @returns Carte skeleton pour un domaine.
 */
export function SkeletonCard() {
    return (
        <div className="rounded-3xl border border-white/40 bg-white/55 shadow-md backdrop-blur p-5">
            {/* Titre */}
            <div className="h-5 w-24 rounded bg-white/70" />

            {/* Sous-titre */}
            <div className="mt-2 h-3 w-32 rounded bg-white/60" />

            {/* KPIs */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-2xl bg-white/60 border border-white/40" />
                <div className="h-10 rounded-2xl bg-white/60 border border-white/40" />
            </div>

            {/* Action / footer */}
            <div className="mt-4 h-10 rounded-2xl bg-white/60" />
        </div>
    );
}
