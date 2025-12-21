import type { ReactNode } from "react";

/**
 * Propriétés du layout de tableau de bord de séance.
 *
 * Ce layout structure la page en plusieurs zones :
 * - un bloc "hero" pleine largeur
 * - une colonne gauche (partie supérieure + éventuelle partie inférieure)
 * - une colonne droite
 * - un message d’erreur global optionnel
 *
 * Il fournit ainsi un cadre cohérent pour les écrans liés aux séances
 * (historique, création, récapitulatif, etc.).
 */
type SessionDashboardLayoutProps = {
    /** Contenu du bandeau principal pleine largeur (titre, CTA, intro…). */
    hero: ReactNode;

    /** Contenu de la partie supérieure de la colonne gauche. */
    leftTop: ReactNode;

    /** Contenu optionnel de la partie inférieure de la colonne gauche. */
    leftBottom?: ReactNode;

    /** Contenu de la colonne droite (résumé, statistiques, encarts, etc.). */
    rightColumn: ReactNode;

    /**
     * Message d’erreur global affiché en haut de la section centrale.
     * Permet de signaler un problème transversal (chargement, sauvegarde…).
     */
    globalErrorMessage?: string | null;
};

/**
 * Layout réutilisable pour les pages de "dashboard" liées aux séances.
 *
 * Il gère :
 * - l'affichage du hero en pleine largeur
 * - un container central avec largeur maximale
 * - une grille responsive (2 colonnes sur desktop)
 * - un bandeau d’erreur global optionnel
 *
 * Les composants enfants sont passés via des props structurées,
 * ce qui permet de conserver une mise en page cohérente tout en
 * laissant une grande liberté sur le contenu.
 *
 * @param props Voir {@link SessionDashboardLayoutProps}.
 * @returns Structure JSX du layout de tableau de bord.
 */
export function SessionDashboardLayout({
                                           hero,
                                           leftTop,
                                           leftBottom,
                                           rightColumn,
                                           globalErrorMessage,
                                       }: SessionDashboardLayoutProps) {
    return (
        <>
            {/* HERO FULL WIDTH */}
            {hero}

            {/* CONTENU CENTRAL CONSTRAINED */}
            <section className="mx-auto max-w-5xl w-full px-4 pt-8 pb-10">
                {globalErrorMessage && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {globalErrorMessage}
                    </div>
                )}

                <div className="mt-4 grid gap-8 lg:grid-cols-[2fr,1.5fr]">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {leftTop}
                        {leftBottom ?? null}
                    </div>

                    {/* RIGHT COLUMN */}
                    {rightColumn}
                </div>
            </section>
        </>
    );
}
