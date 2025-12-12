"use client";

import Image from "next/image";

export type IslandKind = "sleep" | "meditation" | "exercise";
export type IslandSize = "xs" | "sm" | "md";

export interface IslandProps {
    type: IslandKind;
    label: string;
    iconSrc: string;
    onClick?: () => void;

    /**
     * Taille de l'îlot.
     * - `md` : taille moyenne
     * - `sm` : version plus compacte
     */
    size?: IslandSize;
}

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
            icon: "w-[70%] h-[70%]",
            text: "text-sm md:text-base",
            hover: "group-hover:scale-[1.04]",
            marginTop: "mt-2",
        };
    }

    return {
        circle: "w-44 h-44 md:w-48 md:h-48",
        icon: "w-[80%] h-[80%]",
        text: "text-base md:text-lg",
        hover: "group-hover:scale-[1.07]",
        marginTop: "mt-4",
    };
}

export default function Island({
                                   type,
                                   label,
                                   iconSrc,
                                   onClick,
                                   size = "md",
                               }: IslandProps) {
    const gradient = getGradient(type);
    const s = getSizeClasses(size);

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="
        group
        cursor-pointer
        select-none
        flex flex-col items-center
        animate-float
        relative
      "
        >
            {/* Cercle */}
            <div
                className={`
          relative
          flex items-center justify-center
          rounded-full
          ${s.circle}
          bg-gradient-to-b ${gradient}
          shadow-md
          transition-all duration-300
          ${s.hover}
        `}
            >
                {/* Halo interne très léger */}
                <div
                    className="
            pointer-events-none
            absolute inset-0 rounded-full
            bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.35),transparent_70%)]
            opacity-60
            mix-blend-screen
          "
                />

                {/* Icône (responsive) */}
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

            {/* Halo EXTERNE au hover */}
            <div
                className="
                absolute inset-0
                rounded-full
                blur-lg
                opacity-0
                transition-all duration-300
                group-hover:opacity-50
                pointer-events-none
                bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)]
              "
            />

            {/* Texte */}
            <span
                className={`
          ${s.marginTop}
          ${s.text}
          font-semibold
          text-[#233045]
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]
          transition-all
          group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]
        `}
            >
        {label}
      </span>
        </button>
    );
}
