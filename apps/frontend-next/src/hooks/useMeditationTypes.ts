"use client";

import { useEffect, useState } from "react";

/**
 * Représente un type de méditation tel que fourni par l'API.
 *
 * Chaque type correspond à une catégorie de contenu (ex.: "respiration",
 * "scanne corporel", "audio guidée"). Ces types permettent d'organiser
 * l'affichage de la bibliothèque de méditations.
 */
export type MeditationType = {
    /** Identifiant unique du type de méditation (provenant de la base de données). */
    id: string;

    /** Slug technique utilisé pour le routage ou la résolution i18n. */
    slug: string;

    /**
     * Nom du type de méditation, optionnel côté API.
     * La majorité du temps, l'application utilise des traductions
     * basées sur le slug.
     */
    name?: string | null;

    /** Description textuelle fournie par l’API, utilisée notamment dans les listings. */
    description?: string | null;

    /** Indique si le type de méditation est actif et doit être affiché dans l’interface. */
    isActive: boolean;

    /**
     * Ordre d'affichage facultatif. L’API peut le fournir pour organiser les types
     * de manière cohérente dans l'interface.
     */
    sortOrder?: number | null;
};

/**
 * Valeur de retour du hook `useMeditationTypes`.
 *
 * Ce contrat permet de centraliser l'accès aux types de méditation,
 * ainsi que leur état de chargement et la gestion d’erreur.
 */
type UseMeditationTypesResult = {
    /** Liste des types de méditation récupérés depuis l'API. */
    types: MeditationType[];

    /** Indique si la requête est en cours. */
    loading: boolean;

    /** Indique si une erreur réseau ou API s'est produite. */
    error: boolean;
};

/**
 * URL de base de l'API. Défaut local si la variable d'environnement n’est pas fournie.
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Hook React permettant de charger les types de méditation depuis l'API.
 *
 * Ce hook :
 * - effectue une requête `GET /meditation/types`
 * - gère automatiquement les états `loading` et `error`
 * - renvoie les données typées pour une utilisation immédiate dans l'UI
 *
 * Le chargement est déclenché uniquement au montage du composant.
 *
 * @returns Liste des types, état de chargement et état d'erreur.
 */
export function useMeditationTypes(): UseMeditationTypesResult {
    const [types, setTypes] = useState<MeditationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                setLoading(true);
                setError(false);

                const res = await fetch(`${API_BASE_URL}/meditation/types`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = (await res.json()) as MeditationType[];
                setTypes(data);
            } catch (e) {
                console.error("Failed to load meditation types", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, []);

    return { types, loading, error };
}
