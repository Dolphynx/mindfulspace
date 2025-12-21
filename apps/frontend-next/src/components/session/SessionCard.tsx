import type { ReactNode } from "react";

/**
 * Propriétés du composant `SessionCard`.
 *
 * Ce composant affiche un encart visuel destiné à structurer des blocs
 * d’information dans le tableau de bord (statistiques, résumé, actions, etc.).
 *
 * Le rendu applique un fond en dégradé, une bordure arrondie et une ombre légère
 * pour donner un aspect de carte cohérent avec la charte de l’interface.
 */
type SessionCardProps = {
    /** Contenu interne de la carte. */
    children: ReactNode;

    /**
     * Variante de style appliquant un dégradé différent.
     * - "blue" : teintes bleu / indigo
     * - "green" : teintes émeraude / teal
     *
     * La variante "blue" est utilisée par défaut.
     */
    variant?: "blue" | "green";
};

/**
 * Composant générique représentant une carte stylisée pour les séances.
 *
 * Il encapsule :
 * - un fond en dégradé selon la variante sélectionnée
 * - des coins arrondis
 * - un léger ombrage pour le relief
 * - un padding uniforme
 *
 * Ce composant sert principalement d’enveloppe pour du contenu informatif ou interactif.
 *
 * @param props Voir {@link SessionCardProps}.
 * @returns Élément JSX représentant la carte.
 */
export function SessionCard({ children, variant = "blue" }: SessionCardProps) {
    const gradientClass =
        variant === "blue"
            ? "from-sky-100 to-indigo-100"
            : "from-emerald-100 to-teal-100";

    return (
        <section
            className={`rounded-2xl bg-gradient-to-r ${gradientClass} p-6 shadow-sm`}
        >
            {children}
        </section>
    );
}
