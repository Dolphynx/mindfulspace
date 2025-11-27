"use client";

import Image from "next/image";

export type IslandKind = "sleep" | "meditation" | "exercise";

export interface IslandProps {
    type: IslandKind;
    label: string;
    iconSrc: string;
    onClick?: () => void;
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

export default function Island({ type, label, iconSrc, onClick }: IslandProps) {
    const gradient = getGradient(type);

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
            {/* Cercle ULTRA FIN */}
            <div
                className={`
                    relative
                    flex items-center justify-center
                    rounded-full
                    w-44 h-44 md:w-48 md:h-48      /* diamètre global */
                    bg-gradient-to-b ${gradient}
                    shadow-md
                    transition-all duration-300
                    group-hover:scale-[1.07]
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

                {/* Icône agrandie */}
                <Image
                    src={iconSrc}
                    alt={label}
                    width={160}
                    height={160}
                    className="
                        relative
                        w-[80%] h-[80%]
                        object-contain
                    "
                />
            </div>

            {/* Halo EXTERNE au hover (retour du design original) */}
            <div
                className="
                    absolute top-0 left-0 right-0 bottom-0
                    rounded-full
                    blur-xl
                    opacity-0
                    transition-all duration-300
                    group-hover:opacity-60
                    pointer-events-none
                    bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)]
                "
            />

            {/* TEXTE bleu très foncé */}
            <span
                className="
                    mt-4
                    text-base md:text-lg
                    font-semibold
                    text-[#233045]                    /* bleu très foncé */
                    drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]   /* ombre douce */
                    transition-all
                    group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]
                "
            >
                {label}
            </span>
        </button>
    );
}
