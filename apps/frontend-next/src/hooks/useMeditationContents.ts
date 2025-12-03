"use client";

import { useEffect, useState } from "react";

/**
 * Représente un contenu de méditation disponible dans la bibliothèque.
 *
 * Chaque élément correspond à une ressource consommable par l’utilisateur :
 * audio, vidéo ou autre format, selon la valeur du champ `mode`.
 *
 * Les champs de durée permettent au front-end de filtrer intelligemment
 * les contenus en fonction du besoin de l’utilisateur (durée souhaitée,
 * recommandations, etc.).
 */
export type MeditationContent = {
    /** Identifiant unique du contenu dans la base de données. */
    id: string;

    /** Titre affiché dans les listes ou pages de détail. */
    title: string;

    /** Brève description du contenu, optionnelle. */
    description?: string | null;

    /** Identifiant du type de méditation auquel ce contenu appartient. */
    meditationTypeId: string;

    /**
     * Mode de consommation du contenu (audio, vidéo, texte…).
     * L’API fournit une valeur textuelle, typiquement utilisée pour
     * choisir quel player afficher.
     */
    mode: string;

    /** Durée minimale recommandée en secondes, si applicable. */
    minDurationSeconds?: number | null;

    /** Durée maximale recommandée en secondes, si applicable. */
    maxDurationSeconds?: number | null;

    /**
     * Durée par défaut utilisée lorsque l’utilisateur n’en choisit pas.
     *
     * Selon l’implémentation backend, ce champ peut être directement fourni
     * ou dérivé d’un champ générique de durée.
     */
    defaultDurationSeconds?: number | null;

    /** Ordre d'affichage dans les listes, facultatif. */
    sortOrder?: number | null;

    /** Indique si le contenu est réservé aux utilisateurs premium. */
    isPremium: boolean;

    /**
     * URL vers la ressource multimédia (audio, vidéo, etc.).
     * Peut être null si le contenu est textuel ou déterminé différemment.
     */
    mediaUrl: string | null;
};

/**
 * Format retourné par le hook `useMeditationContents`.
 * Il regroupe la liste des contenus, ainsi que les états de chargement et d’erreur.
 */
type UseMeditationContentsResult = {
    /** Liste des contenus correspondant aux paramètres de filtrage. */
    contents: MeditationContent[];

    /** Indique si la requête est en cours. */
    loading: boolean;

    /** Indique si une erreur réseau ou API s’est produite. */
    error: boolean;
};

/**
 * URL de base de l'API, avec fallback local pour le développement.
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Hook permettant de récupérer les contenus de méditation depuis l'API.
 *
 * Ce hook :
 * - effectue une requête `GET /meditation-contents`
 * - applique des paramètres facultatifs (`typeId`, `durationSeconds`)
 * - gère les états `loading` et `error`
 * - réinitialise les contenus si aucun `typeId` n’est fourni
 *
 * Il se réexécute automatiquement lorsque `typeId` ou `durationSeconds` changent.
 *
 * @param typeId Identifiant du type de méditation. Obligatoire pour déclencher le chargement.
 * @param durationSeconds Durée souhaitée, utilisée comme filtre optionnel.
 * @returns Liste filtrée des contenus, état de chargement et état d’erreur.
 */
export function useMeditationContents(
    typeId?: string,
    durationSeconds?: number,
): UseMeditationContentsResult {
    const [contents, setContents] = useState<MeditationContent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Si aucun type n’est sélectionné, on vide simplement la liste.
        if (!typeId) {
            setContents([]);
            return;
        }

        const fetchContents = async () => {
            try {
                setLoading(true);
                setError(false);

                const params = new URLSearchParams();
                params.append("meditationTypeId", typeId);

                // Le paramètre durée est facultatif mais ajouté lorsqu'il est fourni.
                if (durationSeconds !== undefined && durationSeconds !== null) {
                    params.append("durationSeconds", String(durationSeconds));
                }

                const res = await fetch(
                    `${API_BASE_URL}/meditation-contents?${params.toString()}`,
                    { cache: "no-store" },
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = (await res.json()) as MeditationContent[];
                setContents(data);
            } catch (e) {
                console.error("Failed to load meditation contents", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchContents();
    }, [typeId, durationSeconds]);

    return { contents, loading, error };
}
