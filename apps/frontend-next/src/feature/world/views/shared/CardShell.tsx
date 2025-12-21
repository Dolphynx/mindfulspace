import React from "react";
import clsx from "clsx";

/**
 * Enveloppe UI générique pour les sections de l’overview et des vues du World Hub.
 *
 * Objectifs :
 * - Fournir une structure visuelle cohérente (fond, bordure, ombre, padding).
 * - Centraliser la gestion d’un en-tête optionnel (titre, sous-titre, actions à droite).
 * - Rester totalement agnostique du contenu métier.
 *
 * Ce composant est purement présentatif et ne contient aucune logique applicative.
 */
export function CardShell({
                              title,
                              subtitle,
                              right,
                              children,
                              className,
                          }: {
    /**
     * Titre principal de la carte.
     *
     * Peut être une simple chaîne ou un nœud React plus complexe.
     */
    title?: React.ReactNode;

    /**
     * Sous-titre optionnel affiché sous le titre principal.
     */
    subtitle?: React.ReactNode;

    /**
     * Contenu optionnel aligné à droite de l’en-tête.
     *
     * Typiquement utilisé pour :
     * - un bouton d’action,
     * - un lien,
     * - un indicateur secondaire.
     */
    right?: React.ReactNode;

    /**
     * Contenu principal de la carte.
     */
    children: React.ReactNode;

    /**
     * Classes CSS additionnelles permettant d’adapter le layout
     * (marges, positionnement, variations locales).
     */
    className?: string;
}) {
    return (
        <section
            className={clsx(
                "rounded-3xl bg-white/70 backdrop-blur-sm",
                "border border-slate-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
                "p-6",
                className,
            )}
        >
            {(title || right) && (
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {right}
                </header>
            )}

            {children}
        </section>
    );
}
