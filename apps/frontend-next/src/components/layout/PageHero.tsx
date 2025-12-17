/**
 * Composant PageHero
 *
 * - Affiche une "hero section" en haut d’une page, avec :
 *   • une image de fond responsive (Next/Image)
 *   • un voile sombre pour lisibilité
 *   • un titre + un sous-titre optionnel
 *
 * - Entièrement générique :
 *   • le parent peut personnaliser :
 *       - l’image (imageSrc, imageAlt)
 *       - la hauteur (heightClassName)
 *       - le contenu du titre / sous-titre (ReactNode)
 *
 * - Accessibilité :
 *   • alt obligatoire (via `imageAlt`)
 *   • structure simple et sans éléments interactifs
 *
 * - Usage courant : pages d’accueil, pages thématiques, pages de sections.
 */

import Image from "next/image";
import { ReactNode } from "react";

/**
 * Props acceptées par le composant PageHero.
 */
type PageHeroProps = {
    /** Contenu du titre : texte simple ou mise en forme (ReactNode). */
    title: ReactNode;

    /** Sous-titre optionnel affiché sous le titre. */
    subtitle?: ReactNode;

    /** URL de l’image de fond (par défaut : visuel bien-être générique). */
    imageSrc?: string;

    /** Texte alternatif pour l’image (important pour l’accessibilité). */
    imageAlt?: string;

    /**
     * Classe utilitaire définissant la hauteur du hero.
     * Permet d’adapter le composant selon les pages.
     */
    heightClassName?: string;
};

/**
 * PageHero – section visuelle en tête de page.
 *
 * @param title - Le titre principal.
 * @param subtitle - Un sous-titre optionnel.
 * @param imageSrc - Source de l’image.
 * @param imageAlt - Texte alternatif.
 * @param heightClassName - Hauteur personnalisable.
 */
export default function PageHero({
                                     title,
                                     subtitle,
                                     imageSrc = "/images/wellness-hero3.jpg",
                                     imageAlt = "Calm lake at sunrise",
                                     heightClassName = "h-[220px]",
                                 }: PageHeroProps) {
    return (
        <section className="w-full border-b border-brandBorder bg-white">
            <div className={`relative w-full ${heightClassName} overflow-hidden`}>
                {/* Image de fond */}
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    width={1600}
                    height={600}
                    className="w-full h-full object-cover object-center"
                    priority
                />

                {/* Voile sombre léger pour lisibilité du texte */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 pointer-events-none" />

                {/* Bloc texte positionné au centre de la zone */}
                <div className="absolute inset-0 flex flex-col justify-center px-4 mx-auto max-w-7xl">
                    <h1 className="text-2xl font-semibold text-white">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-white text-sm mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
