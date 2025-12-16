"use client";

import Image from "next/image";

export type IslandKind = "sleep" | "meditation" | "exercise";
export type IslandSize = "xs" | "sm" | "md";

/**
 * Propriétés du composant {@link Island}.
 */
export interface IslandProps {
    /**
     * Domaine de l’îlot (utilisé pour déterminer le dégradé).
     */
    type: IslandKind;

    /**
     * Libellé affiché sous l’îlot et utilisé pour l’accessibilité.
     */
    label: string;

    /**
     * Chemin de l’icône affichée au centre de l’îlot.
     */
    iconSrc: string;

    /**
     * Callback déclenché au clic sur l’îlot.
     */
    onClick?: () => void;

    /**
     * Taille de l’îlot (impacte le diamètre, la taille de l’icône et la typographie).
     *
     * @defaultValue "md"
     */
    size?: IslandSize;

    /**
     * Active l’animation de flottement (classe `animate-float`).
     *
     * @defaultValue true
     */
    animated?: boolean;
}

/**
 * Retourne les classes Tailwind du dégradé associé à un domaine.
 *
 * @param type - Domaine de l’îlot.
 * @returns Classes Tailwind `from/to` pour un `bg-gradient-to-b`.
 */
function getGradient(type: IslandKind): string {
    switch (type) {
        case "sleep":
            return "from-[#d7c7ff] to-[#b79aff]";
        case "meditation":
            return "from-[#b9e7ff] to-[#7bc9f3]";
        case "exercise":
            return "from-[#ffd6a7] to-[#ffb88c]";
        default:
            return "from-[#d7c7ff] to-[#b79aff]";
    }
}

/**
 * Retourne les classes Tailwind relatives à la taille pour un îlot.
 *
 * @param size - Taille demandée.
 * @returns Ensemble de classes Tailwind pour le cercle, l’icône, le texte et le hover.
 *
 * @remarks
 * Les classes renvoyées sont regroupées par usage afin de faciliter la composition
 * dans le rendu JSX.
 */
function getSizeClasses(size: IslandSize) {
    if (size === "xs") {
        return {
            circle: "w-24 h-24 sm:w-28 sm:h-28",
            iconBox: "w-[72%] h-[72%]",
            text: "text-xs sm:text-sm",
            hover: "group-hover:scale-[1.03]",
            marginTop: "mt-2",
        };
    }

    if (size === "sm") {
        return {
            circle: "w-32 h-32 md:w-36 md:h-36",
            iconBox: "w-[70%] h-[70%]",
            text: "text-sm md:text-base",
            hover: "group-hover:scale-[1.04]",
            marginTop: "mt-2",
        };
    }

    return {
        circle: "w-44 h-44 md:w-48 md:h-48",
        iconBox: "w-[80%] h-[80%]",
        text: "text-base md:text-lg",
        hover: "group-hover:scale-[1.07]",
        marginTop: "mt-4",
    };
}

/**
 * Bouton "îlot" représentant un domaine (sommeil, méditation, exercice).
 *
 * @remarks
 * - Rend un bouton circulaire avec un dégradé et une icône centrée.
 * - Affiche un libellé sous le bouton.
 * - Le survol applique une légère mise à l’échelle via `group-hover`.
 * - L’animation de flottement est optionnelle via {@link IslandProps.animated}.
 */
export default function Island({
                                   type,
                                   label,
                                   iconSrc,
                                   onClick,
                                   size = "md",
                                   animated = true,
                               }: IslandProps) {
    const gradient = getGradient(type);
    const s = getSizeClasses(size);

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={[
                "group cursor-pointer select-none flex flex-col items-center relative",
                animated ? "animate-float" : "",
            ].join(" ")}
        >
            <div
                className={[
                    "relative flex items-center justify-center rounded-full",
                    s.circle,
                    `bg-gradient-to-b ${gradient}`,
                    "shadow-md transition-all duration-300",
                    s.hover,
                ].join(" ")}
            >
                <div
                    className="
                        pointer-events-none absolute inset-0 rounded-full
                        bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.35),transparent_70%)]
                        opacity-60 mix-blend-screen
                    "
                />

                <div className={`relative ${s.iconBox}`}>
                    <Image
                        src={iconSrc}
                        alt={label}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px"
                        className="object-contain"
                    />
                </div>
            </div>

            <div
                className="
                    absolute inset-0 rounded-full blur-lg opacity-0 transition-all duration-300
                    group-hover:opacity-50 pointer-events-none
                    bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)]
                "
            />

            <span
                className={[
                    s.marginTop,
                    s.text,
                    "font-semibold text-[#233045]",
                    "drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-all",
                    "group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]",
                ].join(" ")}
            >
                {label}
            </span>
        </button>
    );
}
