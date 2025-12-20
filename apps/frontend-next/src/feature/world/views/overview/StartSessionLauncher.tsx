"use client";

import Image from "next/image";
import { useTranslations } from "@/i18n/TranslationContext";
import type { Domain } from "../../hub/types";

/**
 * Domaine autorisé pour le démarrage d’une session.
 *
 * Le domaine "sleep" est explicitement exclu :
 * seules les sessions de méditation et d’exercice peuvent être démarrées.
 */
type StartDomain = Exclude<Domain, "sleep">;

/**
 * Propriétés du composant {@link StartSessionLauncher}.
 */
type Props = {
    /**
     * Domaine actuellement sélectionné pour le démarrage de session.
     */
    active: StartDomain;

    /**
     * Callback déclenché lors d’un changement de domaine.
     *
     * @param d - Domaine sélectionné.
     */
    onChange: (d: StartDomain) => void;
};

/**
 * Configuration statique des domaines disponibles pour le démarrage de session.
 *
 * Chaque entrée définit :
 * - la clé du domaine,
 * - la clé de traduction pour le texte alternatif / tooltip,
 * - la source de l’icône associée.
 */
const ITEMS: {
    key: StartDomain;
    labelKey: "meditationAlt" | "exerciceAlt";
    iconSrc: string;
}[] = [
    { key: "meditation", labelKey: "meditationAlt", iconSrc: "/images/icone_meditation.png" },
    { key: "exercise", labelKey: "exerciceAlt", iconSrc: "/images/icone_exercise.png" },
];

/**
 * Lanceur de démarrage de session par domaine.
 *
 * Rôle :
 * - Afficher les domaines disponibles pour le démarrage d’une session.
 * - Mettre en évidence le domaine actif.
 * - Permettre la sélection du domaine cible avant le lancement.
 *
 * Contraintes fonctionnelles :
 * - Le domaine "sleep" n’est pas proposé (sessions non démarrables).
 *
 * Accessibilité :
 * - Utilise `aria-pressed` pour refléter l’état actif.
 * - Fournit un `title` et un `alt` traduits pour chaque icône.
 *
 * @param props - Propriétés du composant.
 * @returns Sélecteur de domaine pour le démarrage de session.
 */
export function StartSessionLauncher({ active, onChange }: Props) {
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
