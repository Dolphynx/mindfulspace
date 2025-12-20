"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";

/**
 * Propriétés du composant {@link QuickLogLauncher}.
 */
type Props = {
    /**
     * Domaine actuellement actif / sélectionné.
     */
    active: Domain;

    /**
     * Callback déclenché lors d’un changement de domaine.
     *
     * @param d - Domaine sélectionné.
     */
    onChange: (d: Domain) => void;
};

/**
 * Configuration statique des boutons Quick Log par domaine.
 *
 * Chaque entrée définit :
 * - la clé du domaine,
 * - la clé de traduction pour le texte alternatif / tooltip,
 * - la source de l’icône associée.
 */
const ITEMS: {
    key: Domain;
    labelKey: "sleepAlt" | "meditationAlt" | "exerciceAlt";
    iconSrc: string;
}[] = [
    { key: "sleep", labelKey: "sleepAlt", iconSrc: "/images/icone_sleep.png" },
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Lanceur Quick Log par domaine.
 *
 * Rôle :
 * - Afficher une rangée de boutons correspondant aux domaines disponibles.
 * - Indiquer visuellement le domaine actif.
 * - Permettre la sélection d’un domaine pour le Quick Log.
 *
 * Accessibilité :
 * - Utilise `aria-pressed` pour refléter l’état actif.
 * - Fournit un `title` et un `alt` traduits pour chaque icône.
 *
 * @param props - Propriétés du composant.
 * @returns Sélecteur de domaine pour le Quick Log.
 */
export function QuickLogLauncher({ active, onChange }: Props) {
    const tWorld = useTranslations("publicWorld");

    return (
        <div className="flex items-center justify-start gap-3">
            {ITEMS.map((it) => {
                const isActive = it.key === active;

                return (
                    <button
                        key={it.key}
                        type="button"
                        onClick={() => onChange(it.key)}
                        aria-pressed={isActive}
                        title={tWorld(it.labelKey)}
                        className={[
                            "h-14 w-14 rounded-2xl border transition overflow-hidden",
                            "bg-white/60 backdrop-blur shadow-sm",
                            isActive
                                ? "border-slate-300 ring-2 ring-slate-200"
                                : "border-white/40 hover:bg-white/80",
                            "flex items-center justify-center",
                        ].join(" ")}
                    >
                        <div className="relative h-9 w-9">
                            <Image
                                src={it.iconSrc}
                                alt={tWorld(it.labelKey)}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
